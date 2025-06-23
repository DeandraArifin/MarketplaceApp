from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from models import *

app = FastAPI()
account_manager = AccountManager()

@app.get("/")
def root():
    return {
        "message": "Welcome to Nexus App API",
        "endpoints": {
            "register": "/register",
            "login": "/login"
        }
    }

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = account_manager.authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = account_manager.create_user_token(user)

    return {"access_token": access_token, "token_type": "bearer"}


