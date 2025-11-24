from sqlalchemy import Column, Integer, String, Text, DateTime, func, Enum
from app.core.database import Base
import enum

class ArticleCategory(str, enum.Enum):
    gizi = "gizi"
    aditif = "aditif"
    penyakit = "penyakit"
    label = "label"
    tips = "tips"

class AdditiveSafety(str, enum.Enum):
    safe = "safe"
    moderate = "moderate"
    avoid = "avoid"

class EducationArticle(Base):
    __tablename__ = "education_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(Enum(ArticleCategory), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100))
    thumbnail_url = Column(Text, nullable=True)
    view_count = Column(Integer, default=0)
    is_published = Column(Integer, default=1) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class NutritionInfo(Base):
    __tablename__ = "nutrition_info"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50)) 
    unit = Column(String(20))
    daily_value = Column(Integer) 
    description = Column(Text)
    benefits = Column(Text)
    sources = Column(Text)

class Additive(Base):
    __tablename__ = "additives"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20))
    category = Column(String(50))
    safety_level = Column(Enum(AdditiveSafety), default=AdditiveSafety.safe)
    description = Column(Text)
    health_risks = Column(Text)

class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    dietary_recommendations = Column(Text)
    foods_to_avoid = Column(Text)