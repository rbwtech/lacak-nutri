from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, func, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import secrets

# Tabel Asosiasi (Pivot Table)
user_allergies = Table(
    'user_allergies',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('allergen_id', Integer, ForeignKey('allergens.id'))
)

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class Allergen(Base):
    __tablename__ = "allergens"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    description = Column(String(255))
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)

class LocalizationSetting(Base):
    __tablename__ = "localization_settings"
    
    id = Column(Integer, primary_key=True)
    timezone = Column(String(50), unique=True, nullable=False)
    timezone_offset = Column(String(10), nullable=False)
    timezone_label = Column(String(100), nullable=False)
    locale = Column(String(10), nullable=False)
    locale_label = Column(String(50), nullable=False)
    country_code = Column(String(5), nullable=False)
    region = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    
    # Profile
    age = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    gender = Column(String(10), nullable=True)
    timezone = Column(String(50), default='Asia/Jakarta')
    locale = Column(String(10), default='id-ID')
    photo_url = Column(String(255))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    allergies = relationship("Allergen", secondary=user_allergies, backref="users")
    bpom_scans = relationship("ScanHistoryBPOM", back_populates="user")
    ocr_scans = relationship("ScanHistoryOCR", back_populates="user")

class OwnerAuthorizationCode(Base):
    __tablename__ = "owner_auth_codes"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    code = Column(String(8), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)