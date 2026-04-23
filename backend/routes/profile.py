"""User profile — custom slug / handle."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId
from slugify import slugify

from core import db, get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


class ProfileUpdate(BaseModel):
    handle: str = Field(..., min_length=2, max_length=32)
    bio: str = ""


@router.get("/me")
async def get_my_profile(user: dict = Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "handle": user.get("handle") or slugify(user.get("name", "") or user.get("email", "").split("@")[0]),
        "bio": user.get("bio", ""),
        "artist_type": user.get("artist_type", "creator"),
    }


@router.put("/me")
async def update_my_profile(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    handle = slugify(body.handle)
    if not handle:
        raise HTTPException(status_code=400, detail="Invalid handle")
    # Must be unique
    existing = await db.users.find_one({"handle": handle, "_id": {"$ne": ObjectId(user["id"])}})
    if existing:
        raise HTTPException(status_code=409, detail="Handle already taken")
    await db.users.update_one(
        {"_id": ObjectId(user["id"])},
        {"$set": {"handle": handle, "bio": body.bio}}
    )
    return {"handle": handle, "bio": body.bio}


@router.get("/by-handle/{handle}")
async def get_profile_by_handle(handle: str):
    """Public lookup — used for /@handle pages."""
    h = slugify(handle)
    user = await db.users.find_one({"handle": h}, {"_id": 1, "name": 1, "handle": 1, "bio": 1, "artist_type": 1})
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    user["id"] = str(user.pop("_id"))
    return user
