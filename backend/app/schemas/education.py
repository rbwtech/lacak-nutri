from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ArticleCategory(str, Enum):
    gizi = "gizi"
    aditif = "aditif"
    penyakit = "penyakit"
    label = "label"
    tips = "tips"

class AdditiveSafety(str, Enum):
    safe = "safe"
    moderate = "moderate"
    avoid = "avoid"

class AdditiveCategory(str, Enum):
    pemanis = "pemanis"
    pengawet = "pengawet"
    pewarna = "pewarna"
    perisa = "perisa"
    lainnya = "lainnya"

class NutritionCategory(str, Enum):
    makro = "makro"
    mikro = "mikro"

class ArticleBase(BaseModel):
    title: str
    slug: str
    category: ArticleCategory
    author: Optional[str] = None
    thumbnail_url: Optional[str] = None

class ArticleList(ArticleBase):
    id: int
    created_at: datetime
    read_time: str = "5 min"

    class Config:
        from_attributes = True

class ArticleDetail(ArticleList):
    content: str
    view_count: int

class ArticleSearchResult(BaseModel):
    total: int
    page: int
    size: int
    data: list[ArticleList]

class NutritionOut(BaseModel):
    id: int
    name: str
    category: NutritionCategory
    unit: Optional[str] = None
    daily_value: Optional[float] = None
    description: Optional[str] = None
    benefits: Optional[str] = None
    sources: Optional[str] = None
    
    class Config:
        from_attributes = True

class AdditiveOut(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    category: AdditiveCategory
    safety_level: Optional[AdditiveSafety] = "safe"
    description: Optional[str] = None
    health_risks: Optional[str] = None
    
    class Config:
        from_attributes = True

class DiseaseOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    dietary_recommendations: Optional[str] = None
    foods_to_avoid: Optional[str] = None
    
    class Config:
        from_attributes = True