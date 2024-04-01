import pandas as pd
from src.utils import read_config, MySQLAgent
from src.plot_tools import cat_value_count_bar_plot, num_value_count_bar_plot


import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei'] 
plt.rcParams['axes.unicode_minus'] = False


def epa_invest(job_configs, company_account):

    sql_agent = MySQLAgent(job_configs)

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
        "penalty_times": row_count,
        "max_penalty_money": max_penalty_money,
        "latest_penalty_money": latest_penalty_money
    }
    
    return EPA_dict, plot_is_improve