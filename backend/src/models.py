from pydantic import BaseModel

class BasicInfo(BaseModel):
    company_account: str 
    company_name: str
    company_status: str
    company_captial: int
    chairman: str   
    directors: str

class Message(BaseModel):
    message : str