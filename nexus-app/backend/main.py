from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from pydantic import ValidationError
from models import *
from schemas import *
from database import get_db
from fastapi.middleware.cors import CORSMiddleware
import logging

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your app's URL(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")  # "sub" is the username in your token payload
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    account_manager = AccountManager(db)
    user = account_manager.get_user(username)
    if user is None:
        raise credentials_exception
    return user

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
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    account_manager = AccountManager(db)
    user = account_manager.authenticate_user(form_data.username, form_data.password)
    logging.info(f"Login attempt for username: {form_data.username}")


    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = account_manager.create_user_token(user)

    return {"access_token": access_token, "token_type": "bearer", "role": user.account_type.value}

@app.post("/register")
async def register(request: Request, db: Session = Depends(get_db)):
    account_manager = AccountManager(db)
    data = await request.json()

    logging.warning(f"Incoming register request: {data}")  # 👈 DEBUG LOG

    account_type = data.get("account_type")

    try:
        if account_type == 'BUSINESS':
            user = BusinessRegistrationModel(**data)
        elif account_type == 'SERVICEPROVIDER':
            user = ServiceProviderRegisterModel(**data)
        else:
            logging.error("Invalid account type")
            raise HTTPException(status_code=400, detail="Invalid account type")

        logging.info(f"Validated user model for type: {account_type}")
        account_manager.register_user(account_type, user.model_dump())

        return {"message": f"{account_type} account created successfully"}
    
    except ValidationError as e:
        logging.error(f"Validation error: {e.errors()}")
        return JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        logging.exception("Unexpected error")
        return JSONResponse(status_code=500, content={"detail": str(e)})
    
@app.get("/profile")
async def profile(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    
    account_manager = AccountManager(db)
    profile_data = account_manager.get_user_profile(current_user)

    return profile_data