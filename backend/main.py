from fastapi import FastAPI, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64
from setting.config import get_settings
from src.epa_report import epa_invest

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/epa_report")
def epa_invest_result():
    epa_invest_result, plot_is_improve = epa_invest()

    if plot_is_improve:
        plot_is_improve_base64 = base64.b64encode(plot_is_improve.getvalue())
    else:
        plot_is_improve_base64 = None

    # Construct response
    response_data = {
        **epa_invest_result
        #"plot_image": plot_is_improve_base64
    }

    return JSONResponse(content=response_data)


# @app.get("/users/{user_id}")
# def get_users(user_id: int, qry: str = None):
#     return {"user_id": user_id, "query": qry}


@app.get("/info")
def get_infor():
    settings = get_settings()
    return {
        "app_name": settings.app_name,
        "author": settings.author,
        "app_mode": settings.app_mode,
        "port": settings.port,
        "reload": settings.reload,
        "database_url": settings.database_url
    }