import pandas as pd
from src.utils import read_config, MySQLAgent


class ARAnalysis(MySQLAgent):
    def __init__(self, config, company_id) -> None:
        super().__init__(config=config)
        self.set_up(company_id=company_id)

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

    def _get_ar(self):

        query = f"""
        select company_name, trx_number, trx_date, due_date, date_applied, amount_due_original, amount_due_remaining
        from erp_ar
        where company_name = '{self.company_name}' AND due_date <= CURRENT_DATE()
        """

        df_ar = self.read_table(query=query)

        return df_ar

    def _get_application(self):
        query = f"""
        SELECT company_name, cash_receipt_id, receipt_number, trx_number, apply_date, amount_applied
        FROM erp_app 
        WHERE company_name = '{self.company_name}'
        """

        df_app = self.read_table(query=query)

        return df_app

    def _get_receipt(self):
        query = f"""
        SELECT company_name, receipt_number, receipt_method, receipt_date, clear_date, amount, currency_code
        FROM erp_receipt
        WHERE company_name = '{self.company_name}'
        """

        df_receipt = self.read_table(query=query)

        return df_receipt

    def run(self):

        df_ar = self._get_ar()
        df_app = self._get_application()
        df_receipt = self._get_receipt()

        df_ar_app = pd.merge(df_ar, df_app, how='left', on=[
                             'company_name', 'trx_number'])
        df_ar_app_receipt = pd.merge(df_ar_app, df_receipt, how='left', on=[
                                     'company_name', 'receipt_number'])

        result = {
            'ar': df_ar.to_dict(orient='records'),
            'ar_app_receipt': df_ar_app_receipt.to_dict(orient='records')
        }

        return result
