"""
Standard API response envelope — matches the contract already frozen for the
frontend's dummy-data services (ADR-001 §2.6), so swapping from mock JSON to
this real backend requires no shape changes on the React side.
"""
from flask import jsonify


def ok(data=None, message="", status=200):
    return jsonify({"success": True, "data": data, "message": message, "error": None}), status


def fail(message, code="ERROR", details=None, status=400):
    return jsonify({
        "success": False,
        "data": None,
        "message": message,
        "error": {"code": code, "details": details or []},
    }), status
