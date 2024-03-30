import pandas as pd
from src.utils import read_config, MySQLAgent
from src.plot_tools import cat_value_count_bar_plot, num_value_count_bar_plot


import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei'] 
plt.rcParams['axes.unicode_minus'] = False


def epa_invest():

    configs = read_config(path="./conn/connections.json")
    job_configs = configs["CREDITREPORT"]['VM1_mysql_conn_info']
    sql_agent = MySQLAgent(job_configs)

    query = """
        select * from company
    """
    df_company = sql_agent.read_table(query=query)

    i = 0
    # company = df_company.iloc[i]
    company = df_company[df_company['business_accounting_no'] == '27450696']
    company_account = company.business_accounting_no.values[0]
    company_name = company.company_name.values[0]
    internal_id = company.internal_id.values[0]

    try:
        query = f"""
            select * from companyinfo01
            where Business_Accounting_No = {company_account}
        """
        companyinfo01 = sql_agent.read_table(query=query)
        companyinfo01.head()
    except Exception as e:
        print("An error occurred:", e)


    # 公司狀態
    company_status = companyinfo01['Company_Status_Desc'].values[0]

    # 地址關聯 - neo4j

    # 資本額
    company_captial = companyinfo01['Capital_Stock_Amount'].values[0]


    query = f"""
        select * from epa_ems_p_46
        where Business_Accounting_No = {company_account}
    """
    df_epa = sql_agent.read_table(query=query)
    df_epa.columns = df_epa.columns.str.lower()

    # 共有幾筆紀錄
    row_count = df_epa.shape[0]

    # 最高裁處金額
    max_penalty_money = df_epa['penalty_money'].max()

    # 近期裁處金額
    df_epa['penalty_date'] = pd.to_datetime(df_epa['penalty_date'])
    latest_penalty_money = df_epa.loc[df_epa['penalty_date'] == df_epa['penalty_date'].max(), 'penalty_money'].values[0]


    plot_is_improve = cat_value_count_bar_plot(df_epa, 'is_improve', 'skyblue', '環保署裁處後的改善情況', '改善情況類別', '次數')

    EPA_dict = {
        "invest_type": "環保署汙染紀錄",
        "company_name": company_name,
        "company_account": company_account,
        "company_status": company_status,
        "penalty_times": row_count
    }
    
    return EPA_dict, plot_is_improve