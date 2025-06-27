#for sql alchemy models
from datetime import datetime, timedelta, timezone
from enum import Enum as PyEnum
from sqlalchemy import Table, Enum, Float, Column, Integer, String, create_engine, ForeignKey, null, UniqueConstraint, DateTime, Boolean
from sqlalchemy.orm import relationship, Session, with_polymorphic
from sqlalchemy.ext.declarative import declarative_base
from passlib.context import CryptContext
from jose import jwt
from abc import ABC, abstractmethod
from fastapi import HTTPException
import os
from dotenv import load_dotenv

load_dotenv()


SECRET_KEY = os.environ.get("SECRET_KEY")
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

class ListingType(PyEnum):
    JOB = 'JOB'
    PRODUCT = 'PRODUCT'
    
#TODO: add phone number to columns
class Account(Base):
    __tablename__ = 'accounts'
    id = Column(Integer, autoincrement=True, primary_key = True)
    username = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    email = Column(String(255), nullable = False, unique=True)
    phone_number = Column(String(10), nullable=False, unique=True)
    account_type = Column(Enum(AccountType), nullable=False)

    __mapper_args__ = {
        'polymorphic_on' : account_type
    }

    def __init__(self, username, hashed_password, email, phone_number, account_type):
        self.username = username #unique
        self.hashed_password = hashed_password
        self.email = email #unique
        self.phone_number = phone_number #unique
        self.account_type = account_type

    
class BusinessAccount(Account):
    __tablename__ = 'business_accounts'

    id = Column(Integer, ForeignKey('accounts.id'), primary_key=True)
    abn = Column(String(11), unique=True, nullable=False)
    address = Column(String(255), nullable=False)

    __mapper_args__ = {
        'polymorphic_identity' : AccountType.BUSINESS
    }

    def __init__(self, username, hashed_password, email, phone_number, abn, address):
        super().__init__(username, hashed_password, email, phone_number, AccountType.BUSINESS )
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

    def __init__(self, username, hashed_password, email, phone_number, first_name, last_name, address, trade):
        super().__init__(username, hashed_password, email, phone_number, AccountType.SERVICEPROVIDER)
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
        
        #add account to db
        self.session.add(account)

        #commit db updates
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
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)

        to_encode.update({"exp" : expire}) #add expiry to payload
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

        return encoded_jwt
    
    def register_user(self, account_type, user_data):

        try:
            account_type_enum = AccountType(account_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="Unrecognised account type, enum conversion failed")
        
        if self.username_exists(user_data['username']):
            print("Username already exists. Please try a different one.")
            return False

        if account_type_enum == AccountType.BUSINESS:
            #verify ABN
            strategy = ABNVerificationStrategy()
            success = strategy.verify(user_data)
            if not success:
                raise HTTPException(status_code=400, detail="Failed to verify your ABN. Please check your details.")
                return

            #create business account if ABN is verified
            account = BusinessAccount(
                username = user_data['username'],
                email=user_data['email'],
                phone_number=user_data['phone_number'],
                hashed_password = pwd_context.hash(user_data['password']),
                abn = user_data['abn'],
                address = user_data['address']
            )
            
        elif account_type_enum == AccountType.SERVICEPROVIDER:

            #verify identity
            strategy = IdentityVerificationStrategy()
            success = strategy.verify(user_data)

            if not success:
                raise HTTPException(status_code=400, detail="Failed to verify your identity. Please check your credentials")
                return

            #create service provider account if identity is verified
            account = ServiceProviderAccount(
                    username = user_data['username'],
                    hashed_password = pwd_context.hash(user_data['password']),
                    email = user_data['email'],
                    phone_number = user_data['phone_number'],
                    first_name = user_data['first_name'],
                    last_name = user_data['last_name'],
                    address = user_data['address'],
                    trade = user_data['trade'] #maybe fix this to use the enum
                )
                
        else:
            raise HTTPException(status_code=400, detail="Unrecognised account type")
        
        #add account to db
        self.add_account(account)
        return {"message": "Registration successful"}
    
    def get_user_profile(self, user:Account):
        if isinstance(user, ServiceProviderAccount):

            profile_data = {
                "username": user.username,
                "email": user.email,
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "address": user.address,
                "trade": user.trade
            }
        elif isinstance(user, BusinessAccount):

            profile_data = {
                "username": user.username,
                "email": user.email,
                "phone_number": user.phone_number,
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
        

class Application(Base):
    __tablename__ = 'applications'

    id = Column(Integer, autoincrement=True, primary_key=True, index=True)
    applicant_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    listing_id = Column(Integer, ForeignKey('job_listings.id'), nullable=False)

    listing = relationship("JobListing", back_populates="applicants")

    def __init__(self, applicant_id, listing_id):
        self.applicant_id = applicant_id
        self.listing_id = listing_id
        
#association table for listing tags and job listings (normalised)
listing_tags = Table(
    'listing_tags',
    Base.metadata,
    Column('listing_id', ForeignKey('listings.id'), primary_key=True),
    Column('tag_id', ForeignKey('tags.id'), primary_key=True)
)

#TODO: add polymorphic relationships and class functionalities        
class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, autoincrement=True, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)

    listings = relationship("Listing", secondary=listing_tags, back_populates="tags")

class Listing(Base):
    __tablename__ = 'listings'

    id = Column(Integer, autoincrement=True, primary_key=True)
    type = Column(Enum(ListingType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    datetime_required = Column(DateTime, nullable=False)
    created_by = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)

    tags = relationship("Tag", secondary=listing_tags, back_populates="listings")
    
    __mapper_args__ = {
        'polymorphic_on' : type
    }

    def __init__(self, type, title, description, location, datetime_required, created_by, created_at, tags):
        self.type = type
        self.title = title
        self.description = description
        self.location = location
        self.datetime_required = datetime_required
        self.created_by = created_by
        self.created_at = created_at
        self.tags = tags
        
class JobListing(Base):
    __tablename__ = 'job_listings'

    id = Column(Integer, ForeignKey('listings.id'), primary_key=True, nullable=False)
    rate_per_h = Column(Float, nullable=False) #rate per hour

    applicants = relationship("Application", back_populates="listing", cascade="all, delete-orphan")

    __mapper_args__ = {
        'polymorphic_identity' : ListingType.JOB
    }

    def __init__(self, type, title, description, location, datetime_required, created_by, created_at, tags, rate_per_h):
        super().__init__(type, title, description, location, datetime_required, created_by, created_at, tags)
        self.rate_per_h = rate_per_h

    def can_apply(self, service_provider) -> bool:
        #checks if the account is a service provider account and if their trade matches the requirements of the job
        return any(tag in self.tags for tag in service_provider.trade) and isinstance(service_provider, ServiceProviderAccount)
    
    def add_applicant(self,applicant):

        if not self.can_apply(applicant):
            raise HTTPException(
                status_code=403,
                detail="Applicant does not meet trade requirements for this listing."
            )
        
        # Check if already applied (optional safety check)
        if any(app.user_id == applicant.id for app in self.applicants):
            raise HTTPException(
                status_code=409,
                detail="Applicant has already applied for this listing."
            )
        
        if applicant.account_type != AccountType.SERVICEPROVIDER:
            raise HTTPException(status_code=403, detail="Only service providers can apply.")
        
        application = Application(user_id=applicant.id, listing_id=self.id)
        self.applicants.append(application)

    def get_time(self):

        return self.datetime_required

class ProductListing(Base):
    __tablename__ = 'product_listings'

    id = Column(Integer, ForeignKey('listings.id'), primary_key=True, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)

    __mapper_args__ = {
        'polymorphic_identity' : ListingType.PRODUCT
    }

class ListingManager():
    def __init__(self, session: Session):
        self.session = session

    def add_listing(self, listing):

        self.session.add(listing)
        self.session.commit()

    def create_job_listing(self, type, title, description, location, datetime_required, created_by, created_at, tags, rate_per_h):

        job = JobListing(type, title, description, location, datetime_required, created_by, created_at, tags, rate_per_h)
        self.add_listing(job)

        return job



