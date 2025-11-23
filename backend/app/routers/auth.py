from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas import user as schemas
from app.core.security import verify_password, create_access_token
from app.dependencies import get_current_user
from app.models.user import User
import httpx
from app.core.config import settings
from app.schemas.user import ForgotPasswordRequest

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

async def verify_recaptcha(token: str):
    """Verifies the reCAPTCHA token against Google's API."""
    if not settings.RECAPTCHA_SECRET_KEY:
        return True
        
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": settings.RECAPTCHA_SECRET_KEY,
                "response": token
            }
        )
        response.raise_for_status()
        result = response.json()
        
        if not result.get("success") or result.get("score", 1.0) < 0.5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Verifikasi reCAPTCHA gagal. Harap coba lagi."
            )
        return True

@router.post("/register", response_model=schemas.Token)
async def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    await verify_recaptcha(user_in.recaptcha_token)
    
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar.")

    user_data = user_in.model_dump(exclude={"recaptcha_token"})
    user_create_data = schemas.UserCreate(**user_data, password=user_in.password) 
    
    new_user = crud_user.create_user(db, user=user_create_data)
    
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=schemas.Token)
async def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    await verify_recaptcha(user_in.recaptcha_token)

    user = crud_user.get_user_by_email(db, email=user_in.email)
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Email atau password salah.")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/forgot-password-request")
async def forgot_password_request(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    await verify_recaptcha(request.recaptcha_token)
    
    user = crud_user.get_user_by_email(db, email=request.email)
    
    if user:
        print(f"Password reset simulated for {request.email}")
    
    return {"message": "Jika email terdaftar, instruksi reset password telah dikirim."}

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