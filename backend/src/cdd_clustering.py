from src.credit_invest import CreditInvest



class CddClustering(CreditInvest):
    def __init__(self, conn_configs, company_id):
        super().__init__(conn_configs)
        self.no_data_msg = 'NoData'
        self.set_up(company_id=company_id)

    def weekly_clustering(self):

        if self.company_id == None:
            return {"message": self.no_data_msg}, None, None
    
        # print('cdd conn_configs:',conn_configs)

        query = f"""
                select company_name, week_date, light_status AS cred_invest_result from cdd_result
                where company_name = '{self.company_name}'
            """
        df_cdd = self.read_table(query=query)

        if df_cdd.empty:
            return {"message": self.no_data_msg}, None
            
        model_result_cdd = {
            "cdd_weekly_clustering": df_cdd.to_dict(orient="records")
        }

        return model_result_cdd
