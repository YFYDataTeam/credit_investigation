import re
import os
from src.utils import read_config
from src.credit_invest import CreditInvest
from langchain_core.messages import SystemMessage
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain.schema.output_parser import StrOutputParser
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

        query = f"""
        SELECT judgement_date, judgement_no, subjectkey, judgement_text01
        FROM judgement_result
        WHERE business_accounting_no = '{self.company_id}'
        AND judgement_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 5 YEAR);
        """
        df_judgement = self.read_table(query=query)

        if df_judgement.empty:
            return {"message": self.no_data_msg}

        df_judgement_selected = df_judgement.head(5)

        judgement_summary_result = {}
        for _, row in df_judgement_selected.iterrows():
            cleaned_text = self._clean_data(row.judgement_text01)

            llm = ChatGoogleGenerativeAI(
                model="gemini-pro",
                convert_system_message_to_human=True,
                temperature=0,
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                },
            )
            output = {}

            chat_template = ChatPromptTemplate.from_messages(
                [
                    SystemMessage(
                        content="你是一個專業的摘要統整AI助手，擅長於理解並找出法律判決文件中的重點，針對我提出的問題使用繁體中文回覆。"
                    ),
                    HumanMessagePromptTemplate.from_template("{text}")
                ]
            )
            

            summary_text = f"仔細閱讀 REF 的內容，提供我摘要，不要特殊符號跟摘要這兩個字:{cleaned_text}"
            role_text = f"仔細閱讀 REF 的內容，只要告訴我COMPANY扮演的腳色:{cleaned_text}。COMPANY: {self.company_name}"
            influence_text = f"""
            仔細閱讀 REF 的內容，告訴我 COMPANY 公司受到的懲罰為何，包括刑責或是罰錢，若沒有則說沒有受到裁罰。不要有COMPANY字，
            #### REF: {cleaned_text}。
            #### COMPANY: {self.company_name}
            """
            
            output_parser = StrOutputParser()
            chain = chat_template | llm | output_parser

            summary_output = chain.invoke({"text": summary_text})
            role_output = chain.invoke({"text": role_text})
            influence_output = chain.invoke({'text': influence_text})

            output['summary'] = summary_output
            output['role'] = role_output
            output['influence'] = influence_output
            
            
            judgement_summary_result[row.judgement_no] = output


        return judgement_summary_result
