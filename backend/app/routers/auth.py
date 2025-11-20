from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas import user as schemas
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Cek email duplikat
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Email sudah terdaftar."
        )
    
    # 2. Buat user baru
    new_user = crud_user.create_user(db, user=user_in)
    
    # 3. Generate Token langsung agar user auto-login
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. Cari user
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Email atau password salah."
        )
    
    # 2. Verifikasi password
    if not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Email atau password salah."
        )
    
    # 3. Generate Token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }