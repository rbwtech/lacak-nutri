from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas import user as schemas
from app.core.security import verify_password, create_access_token, decode_token
from app.dependencies import get_current_user, verify_recaptcha_v3
from app.models.user import User
from app.core.config import settings
from app.schemas.user import ForgotPasswordRequest, PasswordReset
from app.core.limiter import limiter 
from datetime import timedelta, datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def create_reset_token(email: str):
    """Creates a short-lived JWT (30 min) for password reset."""
    expire_minutes = 30
    to_encode = {"sub": email, "type": "reset"} 
    return create_access_token(to_encode, expires_delta=timedelta(minutes=expire_minutes))

def send_reset_email_task(recipient_email: str, reset_link: str):
    """
    Fungsi ini akan dijalankan di background agar tidak memblokir request utama.
    """
    subject = "Reset Password - LacakNutri"
    logo_url = f"{settings.FRONTEND_BASE_URL}/lacaknutri.png" 
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', sans-serif; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; }}
            .header {{ background: linear-gradient(135deg, #FF9966 0%, #FF5E62 100%); padding: 40px 20px; text-align: center; }}
            .logo {{ width: 80px; height: 80px; background-color: white; border-radius: 50%; padding: 10px; }}
            .content {{ padding: 40px 30px; color: #334155; text-align: center; }}
            .button {{ display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF9966 0%, #FF5E62 100%); color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="{logo_url}" alt="LacakNutri" class="logo">
            </div>
            <div class="content">
                <h2>Lupa Kata Sandi?</h2>
                <p>Kami menerima permintaan reset password untuk akun <strong>{recipient_email}</strong>.</p>
                <a href="{reset_link}" class="button">Reset Kata Sandi Saya</a>
                <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">Tautan berlaku selama 30 menit.</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = formataddr((settings.EMAIL_SENDER_NAME, settings.EMAIL_SENDER_ADDRESS))
    msg["To"] = recipient_email
    msg.attach(MIMEText(body_html, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls() 
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_SENDER_ADDRESS, recipient_email, msg.as_string())
        logger.info(f"EMAIL_SENT: Reset link sent to {recipient_email}")
    except Exception as e:
        logger.error(f"EMAIL_ERROR: Failed to send to {recipient_email}. Error: {e}")

@router.post("/register", response_model=schemas.Token)
@limiter.limit("5/minute") 
async def register(
    request: Request,
    user_in: schemas.UserRegisterRequest, 
    db: Session = Depends(get_db)
): 
    await verify_recaptcha_v3(user_in.recaptcha_token)
    
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar.")

    user_create_data = schemas.UserCreate(
        email=user_in.email,
        name=user_in.name,
        password=user_in.password
    )
    new_user = crud_user.create_user(db, user=user_create_data)
    
    # 4. Generate Token
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=schemas.Token)
@limiter.limit("5/minute") 
async def login(
    request: Request,
    user_in: schemas.UserLogin, 
    db: Session = Depends(get_db)
):
    await verify_recaptcha_v3(user_in.recaptcha_token)

    user = crud_user.get_user_by_email(db, email=user_in.email)
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Email atau password salah.")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/forgot-password-request")
@limiter.limit("3/hour") 
async def forgot_password_request(
    request: Request,
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    await verify_recaptcha_v3(body.recaptcha_token)
    
    user = crud_user.get_user_by_email(db, email=body.email)
    
    if user:
        reset_token = create_reset_token(user.email)
        reset_link = f"{settings.FRONTEND_BASE_URL}/reset-password?token={reset_token}"
        
        background_tasks.add_task(send_reset_email_task, user.email, reset_link)

    return {"message": "Jika email terdaftar, instruksi reset password telah dikirim."}

@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    pass_data: PasswordReset,
    db: Session = Depends(get_db)
):
    try:
        payload = decode_token(pass_data.token) 
        token_type = payload.get("type")
        email = payload.get("sub")
        
        if token_type != "reset":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tautan reset tidak valid.")
            
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tautan reset tidak valid atau sudah kedaluwarsa.")
        
    user = crud_user.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")
    
    if len(pass_data.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password baru minimal 8 karakter.")
        
    crud_user.update_password(db, db_user=user, new_password=pass_data.new_password)
    
    return {"message": "Kata sandi berhasil diatur ulang."}

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