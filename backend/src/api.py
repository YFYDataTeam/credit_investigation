from fastapi import APIRouter, Query, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
import pandas as pd
import numpy as np
from fastapi.responses import JSONResponse
from .models import BasicInfo, Message
from src.utils import read_config
from src.credit_invest import CreditInvest
from src.cdd_clustering import CddClustering
from src.llm_agent import LlmAgent
from src.ar_analysis import ARAnalysis
from src.financial_analysis import FinancialAnalysis
from typing import Union
import base64


router = APIRouter()

conn_path = ".env/connections.json"
configs = read_config(path=conn_path)
conn_configs = configs["CREDITREPORT"]['Crawler_mysql_conn_info']
credit_invest = CreditInvest(conn_configs=conn_configs)

# ar_analysis = ARAnalysis(conn_path=conn_path)

# def verify_token(token: str):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except jwt.PyJWTError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Could not validate credentials",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

# def get_current_user(token: str = Depends(oauth2_scheme)):
#     return verify_token(token)


@router.get("/basicinfo/{company_id}", response_model=Union[BasicInfo, Message])
# async def basic_info_result(company_id: str, user: dict = Depends(get_current_user)):
async def basic_info_result(company_id: str):

    # '83387850'
    # 1104 環球水泥股份有限公司 07568009

    credit_invest.set_up(company_id=company_id)

    basic_info_dict = credit_invest.basic_info()

    if "message" in basic_info_dict and basic_info_dict["message"] == "NoData":
        return {"message": "NoData"}
    else:
        return basic_info_dict


@router.get("/reset_company_id")
async def reset_company_id():
    credit_invest.set_up(company_id=None)


@router.get("/epa_report")
async def epa_invest_result():

    epa_result = credit_invest.epa_analysis()

    return JSONResponse(epa_result)

# class PstReport(BaseModel)


@router.get('/pst_report')
async def pst_invest_result(time_config: str = Query(..., enum=['past', 'future']),
                            year_region: int = Query(None)):

    # '83387850'

    pst_result = credit_invest.pst_analysis(
        time_config=time_config, year_region=year_region)

    return JSONResponse(convert_dict(pst_result))


def get_financial_analysis(company_id: str):
    return FinancialAnalysis(conn_path=conn_path, company_id=company_id)


@router.get('/revenue_analysis/{company_id}')
async def revenue_analysis(financial_analysis: FinancialAnalysis = Depends(get_financial_analysis)):
    revenue_result = financial_analysis.revenue_analysis()
    return JSONResponse(revenue_result)


@router.get('/financial_report/{company_id}')
async def financial_report(financial_analysis: FinancialAnalysis = Depends(get_financial_analysis)):
    result = financial_analysis.financial_report()
    return JSONResponse(result)


@router.get('/cdd_result/{company_id}')
async def cdd_clustering(company_id: str):
    conn_configs = configs["CREDITREPORT"]['VM1_news_mysql_conn_info']
    cdd_cluster = CddClustering(
        conn_configs=conn_configs, company_id=company_id)
    cdd_weekly_clustering = cdd_cluster.weekly_clustering()

    return JSONResponse(convert_dict(cdd_weekly_clustering))


@router.get('/judgement_summary/{company_id}')
async def judgement_summary(company_id: str):
    conn_configs = configs["CREDITREPORT"]['Crawler_mysql_conn_info']
    llm_agent = LlmAgent(conn_configs=conn_configs, company_id=company_id)
    summary = llm_agent.judgement_summary()

    return JSONResponse(summary)


@router.get('/ar_analysis/{company_id}')
async def ar_analysis(company_id: str):
    conn_path = ".env/connections.json"
    configs = read_config(path=conn_path)
    conn_configs = configs["CREDITREPORT"]['VM1_news_mysql_conn_info']
    ar_analysis = ARAnalysis(config=conn_configs, company_id=company_id)

    result = ar_analysis.run()

    return JSONResponse(convert_dict(result))


def convert_dict(d):
    """Convert all int64 values to int"""
    if isinstance(d, dict):
        return {k: convert_dict(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [convert_dict(i) for i in d]
    elif isinstance(d, pd.Timestamp):
        return d.strftime('%Y-%m-%d')
    elif isinstance(d, np.int64):
        return int(d)
    elif isinstance(d, np.float64):
        return float(d)
    else:
        return d
