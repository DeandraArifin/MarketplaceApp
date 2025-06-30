from pydantic import BaseModel, EmailStr, ValidationError
from datetime import datetime
from models import AccountType, TradeType, ListingType

class BaseRegisterModel(BaseModel):
    username: str
    email: EmailStr
    password: str
    phone_number: str
    account_type: AccountType

class BusinessRegistrationModel(BaseRegisterModel):
    abn: str
    address: str

class ServiceProviderRegisterModel(BaseRegisterModel):
    first_name: str
    last_name: str
    address: str
    trade: TradeType

class BaseListingModel(BaseModel):
    type: ListingType
    title: str
    description: str
    location: str
    datetime_required: datetime
    created_by: str
    created_at: datetime

class JobListingModel(BaseListingModel):
    rate_per_h: int

class ProductListing(BaseListingModel):
    price: float
    quantity: int