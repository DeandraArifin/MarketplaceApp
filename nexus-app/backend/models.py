#for sql alchemy models
from datetime import datetime, timedelta
from enum import Enum as PyEnum
from sqlalchemy import Enum, Float, Column, Integer, String, create_engine, ForeignKey, null, UniqueConstraint, DateTime, Boolean
from sqlalchemy.orm import relationship, Session
from sqlalchemy.ext.declarative import declarative_base
from passlib.context import CryptContext
from jose import jwt
from abc import ABC, abstractmethod

SECRET_KEY = "3faaec484d66da6379b4dee511bac8d4"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
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

    def __init__(self, username, hashed_password, email):
        self.username = username #unique
        self.hashed_password = hashed_password
        self.email = email #unique

    
class BusinessAccount(Account):
    __tablename__ = 'business_accounts'

    def __init__(self, username, hashed_password, email, ABN, address):
        self.username = username
        self.hashed_password = hashed_password
        self.email = email
        self.ABN = ABN
        self.address = address

class ServiceProviderAccount(Account):
    __tablename__ = 'service_provider_accounts'

    def __init__(self, username, hashed_password, email, first_name, last_name, address, trade):
        self.username = username
        self.hashed_password = hashed_password
        self.email = email
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
        return self.session.query(Account).filter_by(username=username).first()
    
    def verify_password(self, password, hashed_password):
        return pwd_context.verify(password, hashed_password)

    def authenticate_user(self, username: str, password: str):
        user = self.get_user(username)

        if not user or not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    def create_access_token(data: dict, expires_delta: timedelta=None):
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.fromtimestamp() + expires_delta
        else:
            expire = datetime.fromtimestamp() + timedelta(minutes=15)

        to_encode.update({"exp" : expire}) #add expiry to payload
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

        return encoded_jwt
    
    #edit because verification should occur before account creation
    def register_user(self, account_type, user_data):

        if account_type == AccountType.BUSINESS:

            success = ABNVerificationStrategy(user_data)

            if success:
                account = BusinessAccount(
                    username = user_data['username'],
                    email=user_data['email'],
                    hashed_password = pwd_context.hash(user_data['password']),
                    abn = user_data['abn'],
                    address = user_data['address']
                )
            else:
                return ("Failed to verify your ABN. Please check your details.")
            
        elif account_type == AccountType.SERVICEPROVIDER:

            success = IdentityVerificationStrategy(user_data)
            
            if success:
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
                return ("Failed to verify your identity. Please check your details.")
        else:
            return ("Unrecognised account type")
        
        if account.verify_identity():
            self.add_account(account)
            return ("Registration successful")
        else:
            return ("Identity verification failed")

#just an idea 
class AccountFactory:
    @staticmethod
    def create_account(account_type, data):
        if account_type == AccountType.BUSINESS:
            return BusinessAccount(data)
        
        elif account_type == AccountType.SERVICEPROVIDER:
            return ServiceProviderAccount(data)


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