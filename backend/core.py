"""Shared infra: db client, JWT helpers, Pydantic models.

Imported by route modules in /app/backend/routes/ to avoid circular imports
with server.py (which only creates the app + mounts routers).
"""
from dotenv import load_dotenv
load_dotenv()

import os
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from typing import Annotated, List, Optional, Any, Dict

from fastapi import HTTPException, Request, Depends
from pydantic import BaseModel, BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient


# ─── ObjectId helper ───────────────────────────────────────────────────────────
def coerce_objectid(v):
    if isinstance(v, ObjectId):
        return str(v)
    return v

PyObjectId = Annotated[str, BeforeValidator(coerce_objectid)]

# ─── DB ────────────────────────────────────────────────────────────────────────
mongo_url = os.environ["MONGO_URL"]
db_name   = os.environ["DB_NAME"]
client    = AsyncIOMotorClient(mongo_url)
db        = client[db_name]

# ─── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET    = os.environ.get("JWT_SECRET", "stakked-dev-secret-key-change-in-prod")
JWT_ALGORITHM = "HS256"

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
               "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id,
               "exp": datetime.now(timezone.utc) + timedelta(days=7),
               "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user.pop("_id"))
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(request: Request):
    """Return user dict if authenticated, else None — no 401."""
    try:
        return await get_current_user(request)
    except HTTPException:
        return None
