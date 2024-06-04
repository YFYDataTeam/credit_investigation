import io
import pandas as pd
from src.utils import (
    read_config, 
    MySQLAgent,
    create_qurter)



class FinancialAnalysis(MySQLAgent):
    def __init__(self, conn_path, company_id):
        self.configs = read_config(path=conn_path)
        self.job_configs = self.configs["CREDITREPORT"]['VM1_mysql_conn_info']
        self.no_data_msg = 'NoData'
        super().__init__(self.job_configs)
        self.company_id = company_id
        self.stock_num = self.stock_num_mapping()

            
    def stock_num_mapping(self):

        query = f"""
        SELECT 公司代號 AS stock_num
        FROM listed_otc_company
        WHERE 營利事業統一編號 = {self.company_id}
        """
        df_mapping = self.read_table(query=query)
        return df_mapping['stock_num'][0]

    
    def revenue_analysis(self):
        """
        Demo:
        2313 華通電腦股份有限公司
        1104 環球水泥股份有限公司 07568009
        1231 聯華食品工業股份有限公司
        """

        if self.company_id == None:
            return {"message": self.no_data_msg}, None

        # DB on VM1
        query = f"""
            select * from mops_monthly_report
            where company_id = {self.stock_num}
        """
        df_mops = self.read_table(query=query)

        if df_mops.empty:
            return {"message": self.no_data_msg}, None
        
        df_mops['period'] = df_mops['period_year'].astype(str) + '-' + df_mops['period_month'].astype(str)

        # Sales QoQ
        df_mops['quarter'] = df_mops['period_month'].apply(create_qurter)
        df_mops['year_quarter'] = df_mops['period_year'].astype(str) + df_mops['quarter']
        df_mops_QoQ = df_mops.groupby('year_quarter').agg(year_quarter_sales= ('sales','sum')).reset_index()
        df_mops_QoQ['QoQ'] = (df_mops_QoQ['year_quarter_sales']/df_mops_QoQ['year_quarter_sales'].shift(1))-1
        # Monthly Y2M
        df_monthly_y2m = df_mops.pivot_table(index='period_month', columns='period_year', values='y2m', aggfunc='mean')

        # col_for_drop = ['period', 'comment']
        # df_mops = df_mops.drop(col_for_drop, axis=1)
        result = {
            'revenue_analysis':df_mops.to_dict(orient='records'),
            'sales_qoq': df_mops_QoQ.dropna().to_dict(orient='records'),
            'monthly_y2m': df_monthly_y2m.dropna().to_dict(orient='records')
        }

        return result
    
    def financial_report(self):

        if self.company_id == None:
            return {"message": self.no_data_msg}

        # default is 1104
        query = f"""
            select * from mops_season_report
            WHERE company_id = {self.stock_num}
        """
        df_mops_season_raw = self.read_table(query=query)

        partitions = ['company_id', 'period_year' ,'season', 'acct_name']

        def clean_mops_season_duplicants(df, partitions):

            df['row_seq'] = df.groupby(partitions).cumcount() + 1

            df_output = df[df['row_seq'] == 2].drop(['row_seq'], axis=1) 

            return df_output

        df_mops_season = clean_mops_season_duplicants(df_mops_season_raw, partitions=partitions)

        columns_for_drop = ['report_name', 'company_id', 'company_name', 'creation_date', 'seq']
        cashflow = df_mops_season[df_mops_season['report_name'] == 'CashFlowStatement'].drop(columns_for_drop, axis=1)
        balance = df_mops_season[df_mops_season['report_name'] == 'BalanceSheet'].drop(columns_for_drop, axis=1)
        profitlost = df_mops_season[df_mops_season['report_name'] == 'ProfitAndLose'].drop(columns_for_drop, axis=1)

        cashflow_result = {
            'cashflow': cashflow.to_dict(orient='records')
        }

        balance_result = {
            'balance': balance.to_dict(orient='records')
        }

        profitlost_result = {
            'profitlost': profitlost.to_dict(orient='records')
        }


        return cashflow_result, balance_result, profitlost_result
    

    