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

        # Monthly Sales
        df_monthly_sales = df_mops[['period','sales']]
        # Sales QoQ
        df_mops['quarter'] = df_mops['period_month'].apply(create_qurter)
        df_mops['year_quarter'] = df_mops['period_year'].astype(str) + df_mops['quarter']
        df_mops_QoQ = df_mops.groupby('year_quarter').agg(year_quarter_sales= ('sales','sum')).reset_index()
        df_mops_QoQ['QoQ'] = (df_mops_QoQ['year_quarter_sales']/df_mops_QoQ['year_quarter_sales'].shift(1))-1
        # Sales YoY
        df_mops_YoY = df_mops.groupby('period_year').agg(annual_sales= ('sales','sum')).reset_index()
        df_mops_YoY['YoY'] = (df_mops_YoY['annual_sales']/df_mops_YoY['annual_sales'].shift(1))-1
        # Monthly Y2M
        df_monthly_y2m = df_mops[['period_year', 'period_month', 'sales']].sort_values(['period_year'], ascending=False)

        # col_for_drop = ['period', 'comment']
        # df_mops = df_mops.drop(col_for_drop, axis=1)
        # result = {
        #     'revenue_analysis':df_mops.to_dict(orient='records'),
        #     'sales_qoq': df_mops_QoQ.dropna().to_dict(orient='records'),
        #     'monthly_y2m': df_monthly_y2m.dropna().to_dict(orient='records')
        # }

        result = {
            'monthly_sales': df_monthly_sales.to_dict(orient='records'),
            'quarterly_sales': df_mops_QoQ.dropna().to_dict(orient='records'),
            'annual_sales':  df_mops_YoY.dropna().to_dict(orient='records'),
            'monthly_y2m': df_monthly_y2m.to_dict(orient='records')
        }

        return result
    
    def financial_report(self):

        if self.company_id == None:
            return {"message": self.no_data_msg}
        
        #TODO: switch to CrawlerDB
        #TODO: add a function to check if the MOPS data existed,
        #TODO: write in DB if the data does not existed
        query = f"""
            select * from mops_season_report
            WHERE company_id = {self.stock_num}
        """
        df_mops_season_raw = self.read_table(query=query)


        if df_mops_season_raw.empty:
            return {"message": self.no_data_msg}
    

        partitions = ['company_id', 'period_year' ,'season', 'acct_name']

        def clean_mops_season_duplicants(df, partitions):

            df['row_seq'] = df.groupby(partitions).cumcount() + 1

            df_output = df[df['row_seq'] == 2].drop(['row_seq'], axis=1) 

            return df_output

        df_mops_season = clean_mops_season_duplicants(df_mops_season_raw, partitions=partitions)

        columns_for_drop = ['report_name', 'company_id', 'company_name', 'creation_date', 'seq']
        cashflow = df_mops_season[df_mops_season['report_name'] == 'CashFlowStatement'].drop(columns_for_drop, axis=1)
        balance = df_mops_season[df_mops_season['report_name'] == 'BalanceSheet'].drop(columns_for_drop, axis=1)
        profitloss = df_mops_season[df_mops_season['report_name'] == 'ProfitAndLose'].drop(columns_for_drop, axis=1)

        result = {
            'balance': balance.to_dict(orient='records'),
            'cashflow': cashflow.to_dict(orient='records'),
            'profitloss': profitloss.to_dict(orient='records')
        }


        return result
    

    