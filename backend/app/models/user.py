from sqlalchemy import Column, Integer, String, Enum, DateTime, func, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

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

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    
    # Profil
    age = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    gender = Column(String(10), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relasi Alergi
    allergies = relationship("Allergen", secondary=user_allergies, backref="users")
    phone = Column(String(20))  
    photo_url = Column(String(255)) 