import io
import pandas as pd
from src.utils import (
    read_config, 
    MySQLAgent, 
    OracleAgent,
    create_qurter)
from src.plot_tools import (
    cat_value_count_bar_plot,
    portion_pie_plot,
    mops_bar_plot,
    mops_line_plot
)
from datetime import datetime
import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei'] 
plt.rcParams['axes.unicode_minus'] = False

class CreditInvest(MySQLAgent):
    def __init__(self, conn_path):
        self.configs = read_config(path=conn_path)
        self.job_configs = self.configs["CREDITREPORT"]['VM1_mysql_conn_info']
        self.no_data_msg = 'NoData'
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


            plot_is_improve = cat_value_count_bar_plot(df_epa, 'is_improve', 'skyblue', '環保署裁處後的改善情況', '改善情況類別', '次數')

            epa_dict = {
                "penalty_times": row_count,
                "max_penalty_money": max_penalty_money,
                "latest_penalty_money": latest_penalty_money
            }
            
            return epa_dict, plot_is_improve
        
        except Exception as e:
            error_message = str(e)
            return {"message": "An error occurred while fetching data: " + error_message}, None
    
    # analyze the pre- and post-timepoint pst data with identical functions
    def pst_analysis(self, time_config, year_region):

        if self.company_id == None:
            return {"message": self.no_data_msg}, None, None
        
        try:
            job_configs = self.configs["CREDITREPORT"]['BIDB_conn_info']
            oracle_agent = OracleAgent(job_configs)

            query = f"""
            select * from ODS.w_yfy_crd_pst_f
            where debtor_accounting_no = '{self.company_id}'
            """
            
            df_pst = oracle_agent.read_table(query=query)

            df_pst = df_pst[~df_pst['register_no'].isnull()]

            if df_pst.empty:
                return {"message": self.no_data_msg}, None, None
            
            df_pst['agreement_end_date'] = pd.to_datetime(df_pst['agreement_end_date'])

            current_year = datetime.now().year
            
            if time_config == 'past':
                if df_pst['agreement_end_date'].max() < datetime.now():
                    df_sliced = df_pst[df_pst['agreement_end_date'] <= datetime.now()]
                    years_range = list(range(current_year - year_region, current_year))
                    # for past : max
                    nearest_end_date = df_sliced['agreement_end_date'].max()
                elif df_pst['agreement_end_date'].max() > datetime.now():
                    return {"message": self.no_data_msg}
                
            elif time_config == 'future':
                if df_pst['agreement_end_date'].min() >= datetime.now():
                    df_sliced = df_pst[df_pst['agreement_end_date'] > datetime.now()]
                    years_range = list(range(current_year, current_year +  year_region))
                    # for future: min
                    nearest_end_date = df_sliced['agreement_end_date'].min()

                elif df_pst['agreement_end_date'].min() < datetime.now():
                    return {"message": self.no_data_msg}
                
            else:
                return {"message": 'wrong time config for pst_analysis'}

        except Exception as e:
            error_message = str(e)
            return {"message": "An error occurred while fetching data: " + error_message}, None, None


        # show in terms of different currency
        total_agreement_currency = df_sliced.groupby(['debtor_title','currency'])['agreement_amount'].agg(total_amount='sum').astype('int')
        total_agreement_currency_dict = total_agreement_currency.reset_index().to_dict(orient='records')


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

        if pd.notna(nearest_end_date):
            nearest_end_date_str = nearest_end_date.isoformat()
        else:
            nearest_end_date_str = None

        pst_dict = {
            "company_id": self.company_id,
            "time_config": time_config,
            "total_agreement_currency": total_agreement_currency_dict,
            "nearest_end_date": nearest_end_date_str,
        }

        return pst_dict, pieplot_img_buf, lineplot_img_buf


    # TODO: need stock_id and company_account mapping table
    def mops(self):
        """
        Demo:
        2313 華通電腦股份有限公司
        1104 環球水泥股份有限公司 07568009
        1231 聯華食品工業股份有限公司
        """

        if self.company_id == None:
            return {"message": self.no_data_msg}, None
        
        query = f"""
            select * from mops_monthly_report
            where company_id = 1104
        """
        df_mops = self.read_table(query=query)

        if df_mops.empty:
            return {"message": self.no_data_msg}, None
        
        df_mops['period'] = pd.to_datetime(df_mops['period_year'].astype(str) + '-' + df_mops['period_month'].astype(str))

        # Sales over month
        plot_sales_over_month = mops_line_plot(df_mops, 'period', 'sales','Date', 'Sales', 'Monthly Sales Over Time') 

        # Sales MoM
        x_axis = 'period'
        y_axis = 'var_lastmm'
        x_label = 'Date'
        y_label = 'Sales MoM'
        title = 'Monthly Sales Change Over Time'
        colors = ['green' if x > 0 else 'red' for x in df_mops['var_lastmm']]
        plot_sales_mom = mops_bar_plot(df_mops, colors, x_axis, y_axis, x_label, y_label, title)

        # Sales YoY
        x_axis = 'period'
        y_axis = 'var_lastyy'
        x_label = 'Date'
        y_label = 'Sales YoY'
        title = 'yearly Sales Change Over Time'
        colors = ['green' if x > 0 else 'red' for x in df_mops['var_lastyy']]
        plot_sales_yoy = mops_bar_plot(df_mops, colors, x_axis, y_axis, x_label, y_label, title)

        # Monthly Y2M
        df_pivot = df_mops.pivot_table(index='period_month', columns='period_year', values='y2m', aggfunc='mean')

        # Monthly Y2M by year: multiple line in one chart
        plt.figure(figsize=(12, 6))
        for column in df_pivot.columns:
            color = 'red' if column == 2024 else 'grey'  # Conditional color assignment
            label = f'Year {column}' if column == 2024 else None  # Only label year 2024
            plt.plot(df_pivot.index, df_pivot[column], marker='o', label=label, color=color)
            
            # Annotating the year at the end of each line
            end_point_y = df_pivot[column].iloc[-1]  # Get the last y-value of the series
            end_point_x = df_pivot.index[-1]         # Get the last x-value (month)
            plt.text(end_point_x + 0.1, end_point_y, str(column), color=color, verticalalignment='center')

        plt.xlabel('Month')
        plt.ylabel('Y2M')
        plt.title('Monthly Y2M by Year')
        plt.xticks(range(1, 13))  # Adjusting x-axis for months
        plt.legend(title='Legend')
        plt.grid(True)
        # plt.show()

        plot_sales_y2m = io.BytesIO()
        plt.savefig(plot_sales_y2m, format='png')
        plot_sales_y2m.seek(0)
        plt.close('all')

        # Sales QoQ
        df_mops['quarter'] = df_mops['period_month'].apply(create_qurter)
        df_mops['year_quarter'] = df_mops['period_year'].astype(str) + df_mops['quarter']
        df_mops_QoQ = df_mops.groupby('year_quarter').agg(year_quarter_sales= ('sales','sum')).reset_index()
        df_mops_QoQ['QoQ'] = (df_mops_QoQ['year_quarter_sales']/df_mops_QoQ['year_quarter_sales'].shift(1)).dropna()-1
        x_axis = 'year_quarter'
        y_axis = 'QoQ'
        x_label = 'Year Quarter'
        y_label = 'Sales QoQ change'
        title = 'Sales QoQ'
        colors = ['green' if x > 0 else 'red' for x in df_mops_QoQ['QoQ']]
        plot_sales_qoq = mops_bar_plot(df_mops_QoQ, colors, x_axis, y_axis, x_label, y_label, title, width=1)

        return plot_sales_over_month, plot_sales_yoy, plot_sales_y2m, plot_sales_qoq
    
    def financial_report(self):

        if self.company_id == None:
            return {"message": self.no_data_msg}

        #TODO: build the company_id mapping table
        # default is 1104
        query = """
            select * from mops_season_report
            WHERE company_id = '1104'
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

        result = {
            'cashflow': cashflow.to_dict(orient='records'),
            'balance': balance.to_dict(orient='records'),
            'profitlost': profitlost.to_dict(orient='records')
        }

        return result