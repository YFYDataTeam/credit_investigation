import pandas as pd
from backend.src.utils import MySQLAgent, read_config
import json
from sqlalchemy.types import String

def main():
    # Load configurations
    configs = read_config(path="./backend/.env/connections.json")
    job_configs = configs["CREDITREPORT"]['VM1_mysql_conn_info']
    sql_agent = MySQLAgent(job_configs)

    # Load the CSV data
    file_path = 'backend/mnt/t187ap03_L.csv'
    data = pd.read_csv(file_path)

    # Define the data types for the table columns if necessary
    data_types = {
        '出表日期': String(20),
        '公司代號': String(20),
        '公司名稱': String(50),
        '公司簡稱': String(50),
        '外國企業註冊地國': String(50),
        '產業別': String(50),
        '住址': String(255),
        '營利事業統一編號': String(20),
        '董事長': String(50),
        '總經理': String(50),
        '發言人': String(50),
        '發言人職稱': String(50),
        '代理發言人': String(50),
        '總機電話': String(50),
        '成立日期': String(50),
        '上市日期': String(50),
        '普通股每股面額': String(50),
        '實收資本額': String(50),
        '私募股數': String(50),
        '特別股': String(50),
        '編制財務報表類型': String(50),
        '普通股盈餘分配或虧損撥補': String(50),
        '過戶機構': String(255),
        '過戶地址': String(255),
        '簽證會計師事務所': String(255),
        '簽證會計師1': String(50),
        '簽證會計師2': String(50),
        '英文簡稱': String(50),
        '英文通訊地址': String(255),
        '傳真機號碼': String(50),
        '電子郵件信箱': String(100),
        '網址': String(255),
        '已發行普通股數或TDR原股發行股數': String(50)
    }

    # Insert the data into the table
    sql_agent.write_table(data, 'listed_otc_company', if_exists='append', index=False, data_type=data_types)

if __name__ == "__main__":
    main()


"""
CREATE TABLE listed_otc_company (
    出表日期 VARCHAR(20),
    公司代號 VARCHAR(20),
    公司名稱 VARCHAR(50),
    公司簡稱 VARCHAR(50),
    外國企業註冊地國 VARCHAR(50),
    產業別 VARCHAR(50),
    住址 VARCHAR(255),
    營利事業統一編號 VARCHAR(20),
    董事長 VARCHAR(50),
    總經理 VARCHAR(50),
    發言人 VARCHAR(50),
    發言人職稱 VARCHAR(50),
    代理發言人 VARCHAR(50),
    總機電話 VARCHAR(50),
    成立日期 VARCHAR(50),
    上市日期 VARCHAR(50),
    普通股每股面額 VARCHAR(50),
    實收資本額 VARCHAR(50),
    私募股數 VARCHAR(50),
    特別股 VARCHAR(50),
    編制財務報表類型 VARCHAR(50),
    普通股盈餘分配或虧損撥補 VARCHAR(50),
    股票過戶機構 VARCHAR(255),
    過戶地址 VARCHAR(255),
    過戶電話 VARCHAR(255),
    簽證會計師事務所 VARCHAR(255),
    簽證會計師1 VARCHAR(50),
    簽證會計師2 VARCHAR(50),
    英文簡稱 VARCHAR(50),
    英文通訊地址 VARCHAR(255),
    傳真機號碼 VARCHAR(50),
    電子郵件信箱 VARCHAR(100),
    網址 VARCHAR(255),
    已發行普通股數或TDR原股發行股數 VARCHAR(50)
);

"""