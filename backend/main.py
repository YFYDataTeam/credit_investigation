import json
import uvicorn
from pydantic import BaseModel
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import base64
# from setting.config import get_settings
from src.utils import read_config
from src.credit_invest import CreditInvest

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# conn_path = "./backend/conn/connections.json"
# credit_invest = CreditInvest(conn_path=conn_path)

class BasicInfo(BaseModel):
    company_account: str
    company_name: str
    company_status: str
    company_captial: int
    chairman: str
    directors: str


@app.get("/basicinfo", response_model=BasicInfo)
def basic_info_result():
    # '27450696'
    # '83387850'
    basic_info_dict = credit_invest.basic_info(company_id='83387850')

    return basic_info_dict

# class EpaReport(BaseModel)

@app.get("/epa_report")
def epa_invest_result():
    # credit_invest.basic_info(company_id='83387850')
    epa_invest_result, plot_is_improve = credit_invest.epa_analysis()

    if plot_is_improve:
        plot_is_improve_base64 = base64.b64encode(plot_is_improve.getvalue()).decode('utf8')
    else:
        plot_is_improve_base64 = None

    # Construct response
    response_data = {
        **epa_invest_result,
        "plot_image": plot_is_improve_base64
    }

    return JSONResponse(content=response_data)

# class PstReport(BaseModel)

@app.get('/pst_report')
def pst_invest_result(time_config: str = Query(..., enum=['past', 'future']),
                      year_region: int = Query(None)):


    result = credit_invest.pst_analysis(company_id='27450696', time_config=time_config, year_region=year_region)


    return result

# @app.get("/users/{user_id}")
# def get_users(user_id: int, qry: str = None):
#     return {"user_id": user_id, "query": qry}


# @app.get("/info")
# def get_infor():
#     settings = get_settings()
#     return {
#         "app_name": settings.app_name,
#         "author": settings.author,
#         "app_mode": settings.app_mode,
#         "port": settings.port,
#         "reload": settings.reload,
#         "database_url": settings.database_url
#     } 



if __name__ == "__main__":

    configs = read_config('./frontend/public/configs.json')
    host = configs.get('host', '127.0.0.1')  # Default to 127.0.0.1 if not specified
    port = configs.get('port', 8000)

    conn_path = "./backend/conn/connections.json"
    credit_invest = CreditInvest(conn_path=conn_path)
    # for debug
    # basic_info_dict = credit_invest.basic_info(company_id='83387850')
    # epa_invest_result, plot_is_improve = credit_invest.epa_analysis()
    # credit_invest.pst_analysis('past',5)

    uvicorn.run(app, host=host, port=port)