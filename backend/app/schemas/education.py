from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.education import ArticleCategory, AdditiveSafety

# --- Artikel ---
class ArticleBase(BaseModel):
    title: str
    slug: str
    category: ArticleCategory
    author: Optional[str] = None
    thumbnail_url: Optional[str] = None

class ArticleList(ArticleBase):
    id: int
    created_at: datetime
    read_time: str = "5 min" # Placeholder logic

    class Config:
        from_attributes = True

class ArticleDetail(ArticleList):
    content: str
    view_count: int

# --- Referensi Lain ---
class NutritionOut(BaseModel):
    name: str
    category: str
    description: Optional[str]
    benefits: Optional[str]
    sources: Optional[str]

class AdditiveOut(BaseModel):
    name: str
    code: Optional[str]
    category: str
    safety_level: AdditiveSafety
    description: Optional[str]