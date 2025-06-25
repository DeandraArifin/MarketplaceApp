#for sql alchemy models
from datetime import datetime, timedelta, timezone
from enum import Enum as PyEnum
from sqlalchemy import Enum, Float, Column, Integer, String, create_engine, ForeignKey, null, UniqueConstraint, DateTime, Boolean
from sqlalchemy.orm import relationship, Session, with_polymorphic
from sqlalchemy.ext.declarative import declarative_base
from passlib.context import CryptContext
from jose import jwt
from abc import ABC, abstractmethod
from fastapi import HTTPException


SECRET_KEY = "3faaec484d66da6379b4dee511bac8d4"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DEVELOPMENT_MODE = True

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Base = declarative_base()

class AccountType(PyEnum):
    BUSINESS = 'BUSINESS'
    SERVICEPROVIDER = 'SERVICEPROVIDER'

#can add or reduce more
class TradeType(PyEnum):
    BARISTA = 'BARISTA'
    BARTENDER = 'BARTENDER'
    CHEF = 'CHEF'
    CONCIERGE = 'CONCIERGE'
    FOH = 'FOH'
    MECHANIC = 'MECHANIC'
    PLUMBER = 'PLUMBER'
    ELECTRICIAN = 'ELECTRICIAN'
    HVACTECH = 'HVACTECH'
    

class Account(Base):
    __tablename__ = 'accounts'
    id = Column(Integer, primary_key = True)
    username = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    email = Column(String(255), nullable = False, unique=True)
    account_type = Column(Enum(AccountType), nullable=False)

    __mapper_args__ = {
        'polymorphic_on' : account_type
    }

    def __init__(self, username, hashed_password, email, account_type):
        self.username = username #unique
        self.hashed_password = hashed_password
        self.email = email #unique
        self.account_type = account_type

    
class BusinessAccount(Account):
    __tablename__ = 'business_accounts'

    id = Column(Integer, ForeignKey('accounts.id'), primary_key=True)
    abn = Column(String(11), unique=True, nullable=False)
    address = Column(String(255), nullable=False)

    __mapper_args__ = {
        'polymorphic_identity' : AccountType.BUSINESS
    }

    def __init__(self, username, hashed_password, email, abn, address):
        super().__init__(username, hashed_password, email, AccountType.BUSINESS )
        self.abn = abn
        self.address = address


class ServiceProviderAccount(Account):
    __tablename__ = 'service_provider_accounts'

    id = Column(Integer, ForeignKey('accounts.id'), primary_key=True)
    first_name = Column(String(100), nullable = False)
    last_name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    trade = Column(Enum(TradeType), nullable=False)

    __mapper_args__ = {
        'polymorphic_identity' : AccountType.SERVICEPROVIDER
    }

    def __init__(self, username, hashed_password, email, first_name, last_name, address, trade):
        super().__init__(username, hashed_password, email, AccountType.SERVICEPROVIDER)
        self.first_name = first_name
        self.last_name = last_name
        self.address = address
        self.trade = trade

class AccountManager:
    def __init__(self, session: Session):
        self.session = session
    
    def username_exists(self, username: str):
        return self.session.query(Account).filter_by(username=username).first() is not None

    def add_account(self, account: Account):

        if self.username_exists(account.username):
            #add this as a flash message or pop up in front end
            print("Username already exists. Please try a different one.")
            return False
        
        #success
        self.session.add(account)
        self.session.commit()
        return True

    def get_user(self, username):
        polymorphic_acc = with_polymorphic(Account, '*')

        return self.session.query(Account).filter(polymorphic_acc.username==username).first()
    
    def verify_password(self, password, hashed_password):
        return pwd_context.verify(password, hashed_password)

    def authenticate_user(self, username: str, password: str):
        user = self.get_user(username)

        if not user or not self.verify_password(password, user.hashed_password):
            return None
        
        return user
        
    def create_user_token(self, user):

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        token = self.create_access_token(
            data={"sub" : user.username,
                  "role": user.account_type.value},
            expires_delta = access_token_expires
        )
        return token
    
    def create_access_token(self, data: dict, expires_delta: timedelta=None):
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezzone.utc) + timedelta(minutes=15)

        to_encode.update({"exp" : expire}) #add expiry to payload
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

        return encoded_jwt
    
    #edit because verification should occur before account creation
    def register_user(self, account_type, user_data):

        try:
            account_type_enum = AccountType(account_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="Unrecognised account type, enum conversion failed")
        
        if account_type_enum == AccountType.BUSINESS:

            strategy = ABNVerificationStrategy()
            success = strategy.verify(user_data)
            if not success:
                raise HTTPException(status_code=400, detail="Failed to verify your ABN. Please check your details.")

            
            account = BusinessAccount(
                username = user_data['username'],
                email=user_data['email'],
                hashed_password = pwd_context.hash(user_data['password']),
                abn = user_data['abn'],
                address = user_data['address']
            )
            
        elif account_type_enum == AccountType.SERVICEPROVIDER:

            strategy = IdentityVerificationStrategy()
            success = strategy.verify(user_data)

            if not success:
                raise HTTPException(status_code=400, detail="Failed to verify your identity. Please check your credentials")

            account = ServiceProviderAccount(
                    username = user_data['username'],
                    email = user_data['email'],
                    hashed_password = pwd_context.hash(user_data['password']),
                    first_name = user_data['first_name'],
                    last_name = user_data['last_name'],
                    address = user_data['address'],
                    trade = user_data['trade'] #maybe fix this to use the enum
                )
                
        else:
            raise HTTPException(status_code=400, detail="Unrecognised account type")
        
        
        self.add_account(account)
        return {"message": "Registration successful"}
    
    def get_user_profile(self, user:Account):
        if isinstance(user, ServiceProviderAccount):

            profile_data = {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "address": user.address,
                "trade": user.trade
            }
        elif isinstance(user, BusinessAccount):

            profile_data = {
                "username": user.username,
                "email": user.email,
                "abn": user.abn,
                "address": user.address
            }
        else:
        # fallback or generic profile data
            profile_data = {
                "username": user.username,
                "email": user.email,
            }
        
        return profile_data

class VerificationStrategy(ABC):
    @abstractmethod
    def verify(self, account_data):
        pass

class ABNVerificationStrategy(VerificationStrategy):
    def verify(self, account_data):
        #TODO: implement ABN verification logic
        abn = account_data.get("abn")
        # checkout https://abr.business.gov.au/Help/AbnFormat to validate abn format
        # better client side
        if DEVELOPMENT_MODE:
            return True

class IdentityVerificationStrategy(VerificationStrategy):
    def verify(self, account_data):
        #TODO: integrate DigiID verification later
        name = account_data.get("name")

        if DEVELOPMENT_MODE:
            return True