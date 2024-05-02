from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from .models import BasicInfo, Message
from src.utils import read_config
from src.credit_invest import CreditInvest
from typing import Union
import base64


router = APIRouter()

conn_path = "./backend/conn/connections.json"
credit_invest = CreditInvest(conn_path=conn_path)

@router.get("/basicinfo/{company_id}", response_model=Union[BasicInfo, Message])
async def basic_info_result(company_id : str):
    # '27450696'
    # '83387850'

    credit_invest.set_up(company_id=company_id)
    basic_info_dict = credit_invest.basic_info()

    if "message" in basic_info_dict and basic_info_dict["message"] == "NoData":
        return {"message": "NoData"} 
    else:
        return basic_info_dict  



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
    # time_config = 'past'
    # year_region = 5
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


@router.get('/mops_report')
async def mops_analysis():

    plot_sales_over_month, plot_sales_yoy, plot_sales_y2m, plot_sales_qoq = credit_invest.mops()

    if plot_sales_over_month:
        plot_sales_over_month_base64 = base64.b64encode(plot_sales_over_month.getvalue()).decode('utf-8')
    else:
        plot_sales_over_month_base64 = None

    if plot_sales_yoy:
        plot_sales_yoy_base64 = base64.b64encode(plot_sales_yoy.getvalue()).decode('utf-8')
    else:
        plot_sales_yoy_base64 = None

    if plot_sales_y2m:
        plot_sales_y2m_base64 = base64.b64encode(plot_sales_y2m.getvalue()).decode('utf-8')
    else:
        plot_sales_y2m_base64 = None

    if plot_sales_qoq:
        plot_sales_qoq_base64 = base64.b64encode(plot_sales_qoq.getvalue()).decode('utf-8')
    else:
        plot_sales_qoq_base64 = None
    
    response_data = {
        "plot_sales_over_month": plot_sales_over_month_base64,
        "plot_sales_yoy": plot_sales_yoy_base64,
        "plot_sales_y2m": plot_sales_y2m_base64,
        "plot_sales_qoq": plot_sales_qoq_base64
    }

    return JSONResponse(response_data)