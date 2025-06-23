from pydantic import BaseModel, EmailStr, ValidationError
from models import AccountType, TradeType

class BaseRegisterModel(BaseModel):
    username: str
    email: EmailStr
    password: str
    account_type: AccountType

class BusinessRegistrationModel(BaseRegisterModel):
    abn: str
    address: str

class ServiceProviderRegisterModel(BaseRegisterModel):
    first_name: str
    last_name: str
    address: str
    trade: TradeType
