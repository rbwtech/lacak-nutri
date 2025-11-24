import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "LacakNutri API"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: str = os.getenv("DB_PORT")
    DB_NAME: str = os.getenv("DB_NAME")
    DATABASE_URL: str = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    # External Services
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    RECAPTCHA_SECRET_KEY: str = os.getenv("RECAPTCHA_SECRET_KEY")
    
    # App Settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))

    # --- CORS & FRONTEND URL CONFIG ---
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

    @property
    def FRONTEND_BASE_URL(self) -> str:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        
        valid_origins = [o for o in origins if o != "*"]
        
        secure_origins = [o for o in valid_origins if o.startswith("https://")]
        if secure_origins:
            return secure_origins[0]
        return valid_origins[0]
    
    EMAIL_SENDER_NAME: str = os.getenv("EMAIL_SENDER_NAME")
    EMAIL_SENDER_ADDRESS: str = os.getenv("EMAIL_SENDER_ADDRESS")
    
    SMTP_SERVER: str = os.getenv("SMTP_SERVER")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD")

settings = Settings()