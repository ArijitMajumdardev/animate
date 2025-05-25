from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from sqlalchemy.orm import Session
from src.database import get_db
from src.users import crud
from src.auth.hash import verify_password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def get_current_user(token: str = Depends(oauth2_scheme),db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("user_email")
        if user_email is None:
            raise credentials_exception
        # getting info from DB here using user_email
        db_user = crud.get_user_by_email(db, user_email)
        if not db_user:
            raise credentials_exception

    except JWTError:
        raise credentials_exception
    return {"email": user_email , "username": db_user.username}
