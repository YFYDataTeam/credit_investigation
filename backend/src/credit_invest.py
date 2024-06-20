import io
import pandas as pd
from src.utils import (
    read_config, 
    MySQLAgent, 
    create_qurter)
from datetime import datetime

class CreditInvest(MySQLAgent):
    def __init__(self, conn_configs):
        # self.configs = read_config(path=conn_path)
        self.no_data_msg = 'NoData'
        super().__init__(conn_configs)
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
                return self.company_id
            
        else:
            self.company_id = None
            self.company_name = None
            

    
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
            return  {'message': self.no_data_msg}

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

        try:
            chairman = df_director.loc[df_director['person_position_name'] == '董事長', 'person_name'].values[0]
        except:
            chairman = None
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

        if self.company_id == None:
            return {"message": self.no_data_msg}, None
        
        try:

            query = f"""
                select * from epa_ems_p_46
                where Business_Accounting_No = {self.company_id}
            """
            df_epa = self.read_table(query=query)

            if df_epa.empty:
                return {"message": self.no_data_msg}, None
            
            # record count
            row_count = df_epa.shape[0]

            # highest record
            max_penalty_money = df_epa['penalty_money'].max()

            # latest record
            df_epa['penalty_date'] = pd.to_datetime(df_epa['penalty_date'])
            latest_penalty_money = df_epa.loc[df_epa['penalty_date'] == df_epa['penalty_date'].max(), 'penalty_money'].values[0]


            # plot_is_improve = cat_value_count_bar_plot(df_epa, 'is_improve', 'skyblue', '環保署裁處後的改善情況', '改善情況類別', '次數')

            epa_dict = {
                "penalty_times": row_count,
                "max_penalty_money": max_penalty_money,
                "latest_penalty_money": latest_penalty_money
            }
            
            return epa_dict
        
        except Exception as e:
            error_message = str(e)
            return {"message": "An error occurred while fetching data: " + error_message}, None
    
    # analyze the pre- and post-timepoint pst data with identical functions
    def pst_analysis(self, time_config, year_region):

        if self.company_id == None:
            return {"message": self.no_data_msg}, None, None
        
        try:
            conn_configs = self.configs["CREDITREPORT"]['Crawler_mysql_conn_info']
            sql_agent = MySQLAgent(conn_configs)

            query = f"""
            select * from w_yfy_crd_pst_f
            where debtor_accounting_no = '{self.company_id}'
            """
            
            df_pst = sql_agent.read_table(query=query)

            df_pst = df_pst[~df_pst['register_no'].isnull()]

            if df_pst.empty:
                return {"message": self.no_data_msg}, None, None
            
            df_pst['agreement_end_date'] = pd.to_datetime(df_pst['agreement_end_date'])

            current_year = datetime.now().year

            def sliced_data(df):
                df['agreement_end_year'] = df['agreement_end_date'].dt.year
                years_range = list(range(current_year - year_region, current_year))
                df_sliced = df[df['agreement_end_year'].isin(years_range)]
                return df_sliced
            
            if time_config == 'past':
                df_sliced = sliced_data(df_pst)
                if df_sliced['agreement_end_date'].max() < datetime.now():
                    if df_sliced.empty:
                        return {"message": self.no_data_msg}

                    # for past : max
                    nearest_end_date = df_sliced['agreement_end_date'].max()
                elif df_sliced['agreement_end_date'].max() > datetime.now():
                    return {"message": self.no_data_msg}, None, None
                
            elif time_config == 'future':
                df_sliced = sliced_data(df_pst)
                if df_pst['agreement_end_date'].min() >= datetime.now():
                    
                    if df_sliced.empty:
                        return {"message": self.no_data_msg}
                    # for future: min
                    nearest_end_date = df_sliced['agreement_end_date'].min()

                elif df_pst['agreement_end_date'].min() < datetime.now():
                    return {"message": self.no_data_msg}, None, None
                
            else:
                return {"message": 'wrong time config for pst_analysis'}

        except Exception as e:
            error_message = str(e)
            return {"message": "An error occurred while fetching data: " + error_message}, None, None


        # clean the string in the agreement_amount column
        def convert_to_int(value):
            clean_value = value.replace('(新台幣)', '').replace(',','').strip()
            return clean_value
        
        df_sliced['agreement_amount'] = df_sliced['agreement_amount'].apply(convert_to_int).copy()
        
        df_sliced_clean = df_sliced[df_sliced['agreement_amount']!=""].copy()
        df_sliced_clean['agreement_amount'] = df_sliced_clean['agreement_amount'].astype(int)
        df_sliced_clean['agreement_end_year'] = df_sliced_clean['agreement_end_year'].astype(int)

        # portion of object_type
        overall_object_type_counts = {type: df_sliced['object_type'].count() for type in set(df_sliced['object_type'])}
            
        # agreement_amount by year
        annual_agreement_aggregates = df_sliced_clean.groupby('agreement_end_year')['agreement_amount'].agg(
            total_agreement_amount='sum',
            average_agreement_amount='mean',
            agreement_count='count').reset_index()

        # Round the average_agreement_amount to 2 decimal places
        annual_agreement_aggregates['average_agreement_amount'] = annual_agreement_aggregates['average_agreement_amount'].round()
        annual_object_type_counts = df_sliced_clean.groupby('agreement_end_year')['object_type'].agg(object_counts='size').reset_index()

        if pd.notna(nearest_end_date):
            nearest_end_date_str = nearest_end_date.strftime('%Y-%m-%d')
        else:
            nearest_end_date_str = None

        pst_dict = {
            "company_id": self.company_id,
            "time_config": time_config,
            "nearest_end_date": nearest_end_date_str,
            "annual_agreement_aggregates": annual_agreement_aggregates.to_dict(orient='records'),
            "overall_type_counts": overall_object_type_counts,
            "annual_type_counts": annual_object_type_counts.to_dict(orient='records')
        }

        return pst_dict

    # def cdd_result(self):

    #     if self.company_id == None:
    #         return {"message": self.no_data_msg}, None, None
    
    #     conn_configs = self.job_config['VM1_news_mysql_conn_info']
    #     print('cdd conn_configs:',conn_configs)
    #     sql_agent = MySQLAgent(conn_configs)
    #     query = f"""
    #             select company_name, week_date, light_status AS cred_invest_result from cdd_result
    #             where company_name = '{self.company_name}'
    #         """
    #     df_cdd = sql_agent.read_table(query=query)

    #     if df_cdd.empty:
    #         return {"message": self.no_data_msg}, None
            
    #     model_result_cdd = {
    #         "cdd_weekly_category": df_cdd.to_dict(orient="records")
    #     }

    #     return model_result_cdd
