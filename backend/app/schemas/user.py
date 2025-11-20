from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- Base Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Profile Update ---
class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    gender: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# --- Responses ---
class UserResponse(UserBase):
    id: int
    role: str
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    gender: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None