from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas import user as schemas
from app.core.security import verify_password, create_access_token
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar.")
    
    new_user = crud_user.create_user(db, user=user_in)
    
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Email atau password salah.")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_user = crud_user.update_user(db, db_user=current_user, user_update=user_update)
    return updated_user

@router.post("/change-password")
def change_password(
    pass_data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pass_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Password lama salah.")
    
    crud_user.update_password(db, db_user=current_user, new_password=pass_data.new_password)
    return {"message": "Password berhasil diubah"}