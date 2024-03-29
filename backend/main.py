from fastapi import FastAPI
from setting.config import get_settings
from src.epa_report import epa_invest

app = FastAPI()




@app.get("/")
def hello_word():
    epa_invest_result = epa_invest()
    return epa_invest_result


@app.get("/users/{user_id}")
def get_users(user_id: int, qry: str = None):
    return {"user_id": user_id, "query": qry}


@app.get("/infor")
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