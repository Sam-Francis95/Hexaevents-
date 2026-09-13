from pymongo import MongoClient
from flask_jwt_extended import JWTManager

jwt = JWTManager()


def init_mongo(app, client_override=None):
    """
    Returns (client, db). Accepts an injected client so tests can pass a
    mongomock.MongoClient instead of standing up a real MongoDB server.
    """
    client = client_override or MongoClient(app.config["MONGO_URI"])
    db = client.get_default_database()
    return client, db
