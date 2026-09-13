from flask import jsonify
from werkzeug.exceptions import HTTPException


def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return jsonify({
            "success": False,
            "data": None,
            "message": e.description,
            "error": {"code": (e.name or "ERROR").upper().replace(" ", "_"), "details": []},
        }), e.code

    @app.errorhandler(Exception)
    def handle_unexpected(e):
        app.logger.exception(e)
        return jsonify({
            "success": False,
            "data": None,
            "message": "Something went wrong. Please try again.",
            "error": {"code": "SERVER_ERROR", "details": []},
        }), 500
