from fastapi import FastAPI,Depends
from src.auth import auth_routes
from src.database import Base, engine
from dotenv import load_dotenv
from .auth.check_auth import get_current_user

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def root():
    return {"message": "JWT Auth API running"}


@app.get("/protected-route")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello user {current_user['user_email']}"}