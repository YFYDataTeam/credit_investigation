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
            return {'message': self.no_data_msg}

        # status
        company_status = companyinfo01['company_status_desc'].values[0]
        if company_status == None:
            company_status = ''

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

        if not df_director.empty:
            chairman = df_director.loc[df_director['person_position_name']
                                       == '董事長', 'person_name'].values[0]
            directors_str = ", ".join(
                df_director.loc[df_director['person_position_name'] == '董事', 'person_name'])
        else:
            directors_str = ''
            chairman = ''

        try:
            query = f"""
                select Business_Item_Old AS busi_item
                from companyinfo03_detail_busi
                where Business_Accounting_No = '{self.company_id}'
            """

            df_item = self.read_table(query=query)
        except Exception as e:
            print("An error occurred:", e)

        basic_info_dict = {
            "company_account": self.company_id,
            "company_name": self.company_name,
            "company_status": company_status,
            "company_captial": company_captial,
            "chairman": chairman,
            "directors": directors_str,
            "busi_item": df_item.busi_item.values[0],

        }

        return basic_info_dict

    def epa_analysis(self):

        if self.company_id == None:
            return {"message": self.no_data_msg}, None

        try:

            query = f"""
                select business_accounting_no, fac_name, penalty_money, penalty_date, transgress_type, is_improve, penaltykind, paymentstate
                from epa_ems_p_46
                where Business_Accounting_No = {self.company_id} and penalty_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 YEAR)
            """
            df_epa = self.read_table(query=query)

            if df_epa.empty:
                return {"message": self.no_data_msg}, None

            # record count in terms of penaltykind
            penaltykind_count = df_epa.groupby(
                ['penaltykind']).size().reset_index(name="count")
            # penalty_money in terms of penaltykind
            df_epa['penalty_money'] = df_epa['penalty_money'].astype(int)
            penaltykind_total_money = df_epa.groupby(['penaltykind']).agg(
                penaltykind_amount=('penalty_money', 'sum')).reset_index()
            # is_improve in terms of penalty_kind
            improve_state = df_epa.groupby(
                ['penaltykind', 'is_improve']).size().reset_index(name="count")
            # penalty_money of paymentstate = '尚未繳款'
            penaltykind_unpay = df_epa[df_epa['paymentstate'] == '尚未繳款'].groupby(
                ['penaltykind', 'paymentstate']).agg(penaltykind_amount=('penalty_money', 'sum')).reset_index()

            epa_result = {
                'penaltykind_count': penaltykind_count.to_dict(orient='records'),
                'penaltykind_total_money': penaltykind_total_money.to_dict(orient='records'),
                'improve_state': improve_state.to_dict(orient='records'),
                'penaltykind_unpay': penaltykind_unpay.to_dict(orient='records')
            }

            return epa_result

        except Exception as e:
            error_message = str(e)
            return {"message": "An error occurred while fetching data: " + error_message}, None

    # analyze the pre- and post-timepoint pst data with identical functions
    def pst_analysis(self, time_config, year_region):

        if self.company_id == None:
            return {"message": self.no_data_msg}, None, None

        try:
            query = f"""
            select * from w_yfy_crd_pst_f
            where debtor_accounting_no = '{self.company_id}'
            """

            df_pst = self.read_table(query=query)

            df_pst = df_pst[~df_pst['register_no'].isnull()]

            if df_pst.empty:
                return {"message": self.no_data_msg}, None, None

            df_pst['agreement_end_date'] = pd.to_datetime(
                df_pst['agreement_end_date'])

            current_year = datetime.now().year

            def sliced_data(df):
                df['agreement_end_year'] = df['agreement_end_date'].dt.year
                years_range = list(
                    range(current_year - year_region, current_year))
                df_sliced = df[df['agreement_end_year'].isin(years_range)]
                return df_sliced

            nearest_end_date = None
            if time_config == 'past':
                df_sliced = sliced_data(df_pst)
                if df_sliced['agreement_end_date'].max() < datetime.now():
                    if df_sliced.empty:
                        nearest_end_date = None
                        return {"message": self.no_data_msg}

                    # for past : max
                    nearest_end_date = df_sliced['agreement_end_date'].max()
                elif df_sliced['agreement_end_date'].max() > datetime.now():
                    return {"message": self.no_data_msg}, None, None

            elif time_config == 'future':
                df_sliced = sliced_data(df_pst)
                if df_pst['agreement_end_date'].min() >= datetime.now():

                    if df_sliced.empty:
                        nearest_end_date = None
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
            clean_value = value.replace('(新台幣)', '').replace(',', '').strip()
            return clean_value

        df_sliced['agreement_amount'] = df_sliced['agreement_amount'].apply(
            convert_to_int).copy()

        df_sliced_clean = df_sliced[df_sliced['agreement_amount'] != ""].copy()
        df_sliced_clean['agreement_amount'] = df_sliced_clean['agreement_amount'].astype(
            int)
        df_sliced_clean['agreement_end_year'] = df_sliced_clean['agreement_end_year'].astype(
            int)

        # portion of object_type
        overall_object_type_counts = {
            type: df_sliced['object_type'].count() for type in set(df_sliced['object_type'])}

        # agreement_amount by year
        annual_agreement_aggregates = df_sliced_clean.groupby('agreement_end_year')['agreement_amount'].agg(
            total_agreement_amount='sum',
            average_agreement_amount='mean',
            agreement_count='count').reset_index()

        # Round the average_agreement_amount to 2 decimal places
        annual_agreement_aggregates['average_agreement_amount'] = annual_agreement_aggregates['average_agreement_amount'].round(
        )
        annual_object_type_counts = df_sliced_clean.groupby(
            'agreement_end_year')['object_type'].agg(object_counts='size').reset_index()

        if nearest_end_date:
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
