from pydantic import BaseModel
from typing import Any, Optional, Dict

class ResponseModel(BaseModel):
    success: bool
    data: Any = None
    message: Optional[str] = None
    error_code: Optional[str] = None

def ok(data: Any = None, message: str = "") -> Dict:
    return {"success": True, "data": data, "message": message}

def fail(message: str, error_code: str = "ERROR", status: int = 400) -> Dict:
    # FastAPI handles status codes via Response objects or HTTPException
    # We will use this helper to format the dictionary, but raise HTTPExceptions in routers
    return {"success": False, "message": message, "error_code": error_code}
