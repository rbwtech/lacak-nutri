from pydantic import BaseModel, ConfigDict
from typing import Optional
from decimal import Decimal

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
    
    # Tambahkan field lain jika perlu ditampilkan di list
    
    model_config = ConfigDict(from_attributes=True)

class FoodSearchResult(BaseModel):
    total: int
    page: int
    size: int
    data: list[FoodCatalogOut]