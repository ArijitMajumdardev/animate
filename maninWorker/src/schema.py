from pydantic import BaseModel, EmailStr

class ManimInput(BaseModel):
    code: str
    script:str=None
