import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/


class Config:
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/smartevent")

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-only-placeholder-secret-change-me-before-deploying")
    JWT_ACCESS_TOKEN_EXPIRES_SECONDS = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES_SECONDS", 60 * 60 * 24 * 7))

    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")

    SMTP_HOST = os.environ.get("SMTP_HOST", "")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
    SMTP_USER = os.environ.get("SMTP_USER", "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL", "no-reply@smartevent.ai")
    # Graceful degrade: if no SMTP host is configured, the mailer logs instead
    # of sending — so the app runs cleanly in dev without real credentials.
    EMAIL_ENABLED = bool(os.environ.get("SMTP_HOST"))

    # none | openai | azure — swap providers with zero code changes.
    LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "none")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    AZURE_OPENAI_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY", "")
    AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_DEPLOYMENT = os.environ.get("AZURE_OPENAI_DEPLOYMENT", "")

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")

    # Hackathon submission PDFs -- local disk until Azure Blob/S3 credentials
    # are issued (see app/storage.py). MAX_CONTENT_LENGTH is a real Flask
    # setting name (auto-applied via app.config.from_object) that rejects
    # oversized request bodies before they're even fully read.
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads"))
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_UPLOAD_MB", 20)) * 1024 * 1024
