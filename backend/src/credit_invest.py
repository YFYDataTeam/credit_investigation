import pandas as pd
from src.utils import read_config, MySQLAgent
from src.plot_tools import cat_value_count_bar_plot, num_value_count_bar_plot


class CreditInvest(MySQLAgent):
    def __init__(self, conn_path):
        configs = read_config(path=conn_path)
        self.job_configs = configs["CREDITREPORT"]['VM1_mysql_conn_info']
        super().__init__(self.job_configs)
        self.company_account = None

    # TODO: get the company_id/company_name from frontend
    def basic_info(self, company_id):

        query = """
        select * from company
        """
        df_company = self.read_table(query=query)

        i = 0
        # company = df_company.iloc[i]
        company = df_company[df_company['business_accounting_no'] == company_id]
        self.company_account = company.business_accounting_no.values[0]
        company_name = company.company_name.values[0]
        # internal_id = company.internal_id.values[0]

        # get info from companyinfo01
        try:
            query = f"""
                select * from companyinfo01
                where Business_Accounting_No = '{self.company_account}'
            """
            companyinfo01 = self.read_table(query=query)
        except Exception as e:
            print("An error occurred:", e)

        # status
        company_status = companyinfo01['Company_Status_Desc'].values[0]

        # 地址關聯 - neo4j

        # captial
        company_captial = companyinfo01['Capital_Stock_Amount'].values[0]


        # get director from directorlist
        try:
            query = f"""
                select * from directorlist
                where Business_Accounting_No = '{self.company_account}'
            """
            df_director = self.read_table(query=query)
        except Exception as e:
            print("An error occurred:", e)

        chairman = df_director.loc[df_director['Person_Position_Name'] == '董事長', 'Person_Name'].values[0]
        directors_str = ", ".join(df_director.loc[df_director['Person_Position_Name'] == '董事', 'Person_Name'])

        basic_info_dict = {
            "company_account": self.company_account,
            "company_name": company_name,
            "company_status": company_status,
            "company_captial": company_captial,
            "chairman": chairman,
            "directors": directors_str

        }

        return basic_info_dict

    def epa_analysis(self):

        query = f"""
            select * from epa_ems_p_46
            where Business_Accounting_No = {self.company_account}
        """
        df_epa = self.read_table(query=query)
        df_epa.columns = df_epa.columns.str.lower()

        # record count
        row_count = df_epa.shape[0]

        # highest record
        max_penalty_money = df_epa['penalty_money'].max()

        # latest record
        df_epa['penalty_date'] = pd.to_datetime(df_epa['penalty_date'])
        latest_penalty_money = df_epa.loc[df_epa['penalty_date'] == df_epa['penalty_date'].max(), 'penalty_money'].values[0]


        plot_is_improve = cat_value_count_bar_plot(df_epa, 'is_improve', 'skyblue', '環保署裁處後的改善情況', '改善情況類別', '次數')

        EPA_dict = {
            "invest_type": "環保署汙染紀錄",
            "penalty_times": row_count,
            "max_penalty_money": max_penalty_money,
            "latest_penalty_money": latest_penalty_money
        }
        
        return EPA_dict, plot_is_improve


    def mops(self):

        return