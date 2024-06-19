import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import router
from src.utils import read_config
from src.credit_invest import CreditInvest

app = FastAPI()
app.include_router(router)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


if __name__ == "__main__":


    configs = {
    "host": "0.0.0.0",
    "port": 8006,
    "year_region": 5
    }

    host = configs.get('host', '127.0.0.1')  # Default to 127.0.0.1 if not specified
    port = configs.get('port', 8000)

    # conn_path = "backend/.env/connections.json"
    # credit_invest = CreditInvest(conn_path=conn_path)

    # for debug
    # company_id = '86156446'
    # credit_invest.set_up(company_id=company_id)
    # basic_info_dict = credit_invest.basic_info()
    # epa_invest_result, plot_is_improve = credit_invest.epa_analysis()
    # pst_result, pieplot_img_buf, lineplot_img_buf = credit_invest.pst_analysis('past',5)


    uvicorn.run(app, host=host, port=port)