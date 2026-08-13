import bcrypt
from flask_jwt_extended import create_access_token


def hash_password(plain_password):
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def issue_token(user):
    identity = str(user["_id"])
    additional_claims = {"role": user.get("role", "participant"), "email": user.get("email")}
    return create_access_token(identity=identity, additional_claims=additional_claims)
