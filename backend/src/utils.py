# import oracledb
import pandas as pd
import json
from sqlalchemy import create_engine
import warnings



def read_config(path):
    try:
        with open(path, 'r') as file:
            configs = json.load(file)

        return configs
    except FileNotFoundError:
        print(f"The file {path} was not found.")
    except json.JSONDecodeError:
        print(f"Error decoding JSON from the file {path}.")

# class OracleAgent:
#     def __init__(self, config) -> None:
#         self.config = config
#         self.db_connector()

#     def db_connector(self):

#         oracle_client_dir = './opt/oracle/'

#         oracle_client_path = os.path.join(oracle_client_dir, os.listdir(oracle_client_dir)[0])

#         oracledb.init_oracle_client(oracle_client_path)
        
#         user = self.config['user']
#         pw = self.config['pw']
#         host = self.config['host']
#         port = self.config['port']
#         database = self.config['database']
#         connection_string = f'{user}/{pw}@{host}:{port}/{database}'
#         self.conn = oracledb.connect(connection_string)

    def read_table(self, sql):
        warnings.filterwarnings('ignore')

        result = pd.read_sql(sql, con=self.conn)
        result.columns = result.columns.str.lower()

        return result


class MySQLAgent:
    def __init__(self, config) -> None:
        self.config = config
        self.db_connector()

    def db_connector(self):
        user = self.config['user']
        pw = self.config['pw']
        host = self.config['host']
        port = self.config['port']
        database = self.config['database']

        connection_string = f"mysql+pymysql://{user}:{pw}@{host}:{port}/{database}?charset=utf8mb4"

        self.engine = create_engine(connection_string)

    def read_table(self, query) -> pd.DataFrame:

        df = pd.read_sql(query, con=self.engine)

        return df

    def write_table(self, data, table_name, if_exists, index, data_type):

        data.to_sql(name=table_name, con=self.engine,
                    if_exists=if_exists, index=index, dtype=data_type)
