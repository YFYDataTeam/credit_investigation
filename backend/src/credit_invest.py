import io
import pandas as pd
from src.utils import read_config, MySQLAgent, OracleAgent
from src.plot_tools import cat_value_count_bar_plot, num_value_count_bar_plot, portion_pie_plot
from datetime import datetime
import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei'] 
plt.rcParams['axes.unicode_minus'] = False

class CreditInvest(MySQLAgent):
    def __init__(self, conn_path):
        self.configs = read_config(path=conn_path)
        self.job_configs = self.configs["CREDITREPORT"]['VM1_mysql_conn_info']
        super().__init__(self.job_configs)
        self.company_id = None
        self.company_name = None


    def set_up(self, company_id=None, company_name=None):

        if company_id:
            query = f"""
            select * from company
            where Business_Accounting_No = '{company_id}'
            """
            df_company = self.read_table(query=query)

            if df_company.empty:
                # reset
                self.company_id = None
                self.company_name = None
                return None
            else:
                self.company_name = df_company.company_name.values[0]
                self.company_id = company_id

        elif company_name:
            query = f"""
            select * from company
            where company_name = '{company_name}'
            """
            df_company = self.read_table(query=query)

            if df_company.empty:
                # reset
                self.company_id = None
                self.company_name = None
                return None
            else:
                self.company_id = df_company.business_accounting_no.values[0]
                self.company_name = company_name

    
    def basic_info(self):

        # get info from companyinfo01
        try:
            query = f"""
                select * from companyinfo01
                where Business_Accounting_No = '{self.company_id}'
            """
            companyinfo01 = self.read_table(query=query)
        except Exception as e:
            print("An error occurred:", e)

        if companyinfo01.empty:
            return  {'message': 'NoData'}

        # status
        company_status = companyinfo01['company_status_desc'].values[0]

        # 地址關聯 - neo4j

        # captial
        company_captial = companyinfo01['capital_stock_amount'].values[0]


        # get director from directorlist
        try:
            query = f"""
                select * from directorlist
                where Business_Accounting_No = '{self.company_id}'
            """
            df_director = self.read_table(query=query)
        except Exception as e:
            print("An error occurred:", e)

        chairman = df_director.loc[df_director['person_position_name'] == '董事長', 'person_name'].values[0]
        directors_str = ", ".join(df_director.loc[df_director['person_position_name'] == '董事', 'person_name'])

        basic_info_dict = {
            "company_account": self.company_id,
            "company_name": self.company_name,
            "company_status": company_status,
            "company_captial": company_captial,
            "chairman": chairman,
            "directors": directors_str

        }

        return basic_info_dict

    def epa_analysis(self):

        query = f"""
            select * from epa_ems_p_46
            where Business_Accounting_No = {self.company_id}
        """
        df_epa = self.read_table(query=query)

        if df_epa.empty:
            return {"message": "No data found for the specified company account."}, None

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
    
    # analyze the pre- and post-timepoint pst data with identical functions
    def pst_analysis(self, time_config, year_region):

        job_configs = self.configs["CREDITREPORT"]['BIDB_conn_info']
        oracle_agent = OracleAgent(job_configs)

        query = f"""
        select * from ODS.w_yfy_crd_pst_f
        where debtor_accounting_no = '{self.company_id}'

        """
        # where debtor_accounting_no = '{company_account}'
        df = oracle_agent.read_table(query=query)
        df['agreement_end_date'] = pd.to_datetime(df['agreement_end_date'])

        current_year = datetime.now().year
        
        if time_config == 'past':
            if df['agreement_end_date'].max() < datetime.now():
                df_sliced = df[df['agreement_end_date'] <= datetime.now()]
                years_range = list(range(current_year - year_region, current_year))
                # for past : max
                nearest_end_date = df_sliced['agreement_end_date'].max()
            elif df['agreement_end_date'].max() > datetime.now():
                return print('過去沒有動產擔保紀錄')
            
        elif time_config == 'future':
            if df['agreement_end_date'].min() >= datetime.now():
                df_sliced = df[df['agreement_end_date'] > datetime.now()]
                years_range = list(range(current_year, current_year +  year_region))
                # for future: min
                nearest_end_date = df_sliced['agreement_end_date'].min()

            elif df['agreement_end_date'].min() < datetime.now():
                return print('未來沒有動產擔保紀錄')
            
        else:
            return print('wrong time config for pst_analysis')


        # show in terms of different currency
        total_agreement_currency = df_sliced.groupby(['debtor_title','currency'])['agreement_amount'].agg(total_amount='sum').astype('int64')


        # portion of object_type
        pieplot_img_buf = portion_pie_plot(df_sliced, 'object_type', '抵押品類別分布')
            

        # count times by agreement_end_date in terms of year
        data_year = [date.year for date in df_sliced['agreement_end_date']]
        counts = {year: 0 for year in years_range}
        for year in data_year:
            if year in counts:
                counts[year] += 1
        years = list(counts.keys())
        values = list(counts.values())
        plt.figure(figsize=(10, 6))
        plt.plot(years, values, marker='o', linestyle='-', color='blue')
        if time_config == 'past':
            plt.title(f'過去{year_region}年逐年動產擔保到期次數')
        elif time_config == 'future':
            plt.title(f'未來{year_region}年逐年動產擔保到期次數')
        plt.xlabel('年')
        plt.ylabel('次數')
        plt.xticks(years)
        plt.grid(True)
        # plt.show()
        
        lineplot_img_buf = io.BytesIO()
        plt.savefig(lineplot_img_buf, format='png')
        lineplot_img_buf.seek(0)
        plt.close('all')

        return total_agreement_currency, nearest_end_date, pieplot_img_buf, lineplot_img_buf


    # TODO: need stock_id and company_account mapping table
    def mops(self):

        return
    

