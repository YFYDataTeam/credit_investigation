import re
import os
from src.utils import read_config
from src.credit_invest import CreditInvest
from langchain.schema import SystemMessage, HumanMessage
import google.generativeai as genai
import google.ai.generativelanguage as glm
from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
)

llm_configs = read_config(path=".env/configs.json")
api_key =llm_configs['g_key']
os.environ["GOOGLE_API_KEY"] = api_key
genai.configure(api_key=api_key)

class LlmAgent(CreditInvest):
    def __init__(self, conn_configs, company_id):
        super().__init__(conn_configs)  
        # self.conn_info = read_config(path=conn_path)
        # self.configs = self.conn_info["CREDITREPORT"]['Crawler_mysql_conn_info']
        # self.db_connector()
        self.no_data_msg = 'NoData'
        self.set_up(company_id=company_id)

    @staticmethod
    def _clean_data(data):
        # Remove specific unicode characters
        cleaned_data = re.sub(r'\u3000', '', data)
        
        # Replace multiple spaces with a single space
        cleaned_data = re.sub(r'\s{2,}', ' ', cleaned_data)
        
        # Remove leading and trailing spaces on each line
        cleaned_data = re.sub(r'^\s+|\s+$', '', cleaned_data, flags=re.MULTILINE)
        
        # Remove redundant newlines
        cleaned_data = re.sub(r'\n\s*\n', '\n', cleaned_data)

        cleaned_data = re.sub(r'\n', '', cleaned_data)

        cleaned_data = re.sub(r'\s', '', cleaned_data)
        
        return cleaned_data
    
    @staticmethod
    def _extract_section(data, start_keyword, end_keyword):
        # Use regex to find the text between start_keyword and end_keyword
        pattern = re.compile(f'{start_keyword}(.*?){end_keyword}', re.DOTALL)
        match = pattern.search(data)
        if match:
            return match.group(1).strip()
        else:
            return None
        
    
    def judgement_summary(self):
        try:
            query = f"""
            SELECT judgement_date, judgement_no, subjectkey, judgement_text01
            FROM judgement_result
            WHERE business_accounting_no = '{self.company_id}'
            AND judgement_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 5 YEAR);
            """
            print("HERE:", self.connection_string)
            df_judgement = self.read_table(query=query)

            

            judgement_summary_result = {}
            for _, row in df_judgement.iterrows():
                cleaned_data = self._clean_data(row.judgement_text01)

                llm = ChatGoogleGenerativeAI(
                    model="gemini-pro",
                    convert_system_message_to_human=True,
                    safety_settings={
                        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                    },
                )


                messages = [
                    SystemMessage(content="你是一個專業的摘要統整AI助手，針對我提出的問題使用繁體中文回覆。"),
                    HumanMessage(content=f"""
                    #### INSTRUCTION: 仔細閱讀 REF 的內容，提供我以下內容:
                                1. REF 的摘要
                                2. COMPANY 公司在其中扮演的腳色
                                3. COMPANY 公司在其中受到的影響
                                若沒有找到滿足我需求的內容則說沒有，不要亂作答不然外婆會難過。
                    #### REF: {cleaned_data}
                    #### COMPANY: {self.company_name}
                """)
                ]

                llm_response = llm(messages)
                judgement_summary_result[row.judgement_no] = llm_response.content


            return judgement_summary_result
        except:
            print(self.configs)