from sqlalchemy import Column, Integer, String, Float, DateTime, func, DECIMAL
from app.core.database import Base

class FoodCatalog(Base):
    __tablename__ = "food_catalog"

    id = Column(Integer, primary_key=True, index=True)
    original_code = Column(String(20))
    name = Column(String(255), nullable=False, index=True)
    weight_g = Column(DECIMAL(10, 2), default=100)
    
    # Makro
    calories = Column(DECIMAL(10, 2), default=0)
    protein = Column(DECIMAL(10, 2), default=0)
    fat = Column(DECIMAL(10, 2), default=0)
    carbs = Column(DECIMAL(10, 2), default=0)
    sugar = Column(DECIMAL(10, 2), default=0)
    fiber = Column(DECIMAL(10, 2), default=0)
    
    # Mikro
    sodium_mg = Column(DECIMAL(10, 2), default=0)
    potassium_mg = Column(DECIMAL(10, 2), default=0)
    calcium_mg = Column(DECIMAL(10, 2), default=0)
    iron_mg = Column(DECIMAL(10, 2), default=0)
    cholesterol_mg = Column(DECIMAL(10, 2), default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())