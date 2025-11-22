from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime

class ProductDetail(BaseModel):
    id: int
    product_type: str
    product_name: str
    bpom_number: Optional[str] = None
    product_data: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class FoodCatalogOut(BaseModel):
    id: int
    name: str
    weight_g: Decimal
    calories: Decimal
    protein: Decimal
    fat: Decimal
    carbs: Decimal
    sugar: Decimal
    sodium_mg: Decimal
    
    model_config = ConfigDict(from_attributes=True)

class FoodSearchResult(BaseModel):
    total: int
    page: int
    size: int
    data: list[FoodCatalogOut]