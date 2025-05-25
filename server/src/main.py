from fastapi import FastAPI,Depends
from src.auth import auth_routes
from src.database import Base, engine
from dotenv import load_dotenv
from .auth.check_auth import get_current_user


load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def root():
    return {"message": "JWT Auth API running"}


@app.get("/valid_token")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {
        "user": {
            "email": current_user["email"],
            "username": current_user["username"],
        }
    }