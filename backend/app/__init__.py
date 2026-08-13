import os
from datetime import timedelta

from flask import Flask, send_from_directory
from flask_cors import CORS

from .config import Config
from .extensions import jwt, init_mongo


def create_app(config_class=Config, mongo_client_override=None):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=config_class.JWT_ACCESS_TOKEN_EXPIRES_SECONDS)

    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)
    jwt.init_app(app)

    mongo_client, db = init_mongo(app, client_override=mongo_client_override)
    app.mongo_client = mongo_client
    app.db = db

    from .auth.routes import auth_bp
    from .users.routes import users_bp
    from .events.routes import events_bp
    from .registrations.routes import registrations_bp
    from .notifications.routes import notifications_bp
    from .certificates.routes import certificates_bp
    from .feedback.routes import feedback_bp
    from .chatbot.routes import chatbot_bp
    from .submissions.routes import submissions_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(events_bp, url_prefix="/api/events")
    app.register_blueprint(registrations_bp, url_prefix="/api/registrations")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(certificates_bp, url_prefix="/api/certificates")
    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
    app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")
    app.register_blueprint(submissions_bp, url_prefix="/api/submissions")

    from .common.errors import register_error_handlers
    register_error_handlers(app)

    # Serves locally-stored submission PDFs (see app/storage.py). Not under
    # /api since it's a file, not a JSON envelope -- the frontend builds the
    # full URL from what /api/submissions/... returns.
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.get("/api/health")
    def health():
        return {"success": True, "data": {"status": "ok"}, "message": "", "error": None}

    return app
