from fastapi import APIRouter, Query, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from fastapi.responses import JSONResponse
from .models import BasicInfo, Message
from src.utils import read_config
from src.credit_invest import CreditInvest
from src.financial_analysis import FinancialAnalysis
from typing import Union
import base64


router = APIRouter()

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

conn_path = ".env/connections.json"
credit_invest = CreditInvest(conn_path=conn_path)

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
#async def basic_info_result(company_id: str, user: dict = Depends(get_current_user)):
async def basic_info_result(company_id : str):

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

    epa_result, plot_is_improve = credit_invest.epa_analysis()

    if plot_is_improve:
        plot_is_improve_base64 = base64.b64encode(plot_is_improve.getvalue()).decode('utf8')
    else:
        plot_is_improve_base64 = None

    # Construct response
    response_data = {
        **epa_result,
        "plot_image": plot_is_improve_base64
    }

    return response_data

# class PstReport(BaseModel)

@router.get('/pst_report')
async def pst_invest_result(time_config: str = Query(..., enum=['past', 'future']),
                            year_region: int = Query(None)):
    
    # '83387850'

    pst_result, pieplot_img_buf, lineplot_img_buf = credit_invest.pst_analysis(time_config=time_config, year_region=year_region)

    if pieplot_img_buf:
        pieplot_img_base64 = base64.b64encode(pieplot_img_buf.getvalue()).decode('utf-8')
    else:
        pieplot_img_base64 = None

    if lineplot_img_buf:
        lineplot_img_base64 = base64.b64encode(lineplot_img_buf.getvalue()).decode('utf-8')
    else:
        lineplot_img_base64 = None

    response_data = {
        **pst_result,
        'pst_type_distribution': pieplot_img_base64,
        'pst_enddate_over_year': lineplot_img_base64
    }
    return JSONResponse(content=response_data)


@router.get('/revenue_analysis/{company_id}')
async def revenue_analysis(company_id: str):
    financial_analysis = FinancialAnalysis(conn_path=conn_path, company_id=company_id)
    revenue_result = financial_analysis.revenue_analysis()

    return JSONResponse(revenue_result)


@router.get('/financial_report/{company_id}')
async def financial_report(company_id: str):
    financial_analysis = FinancialAnalysis(conn_path=conn_path, company_id=company_id)
    result = financial_analysis.financial_report()

    return JSONResponse(result)