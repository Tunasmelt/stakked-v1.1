"""Community template marketplace — public templates any user can browse and fork."""
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from core import db, get_optional_user

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    # Don't leak the creator's internal user_id
    doc.pop("user_id", None)
    return doc


@router.get("/templates")
async def list_public_templates(user: dict = Depends(get_optional_user)):
    items = []
    async for doc in db.templates.find({"public": True}).sort("uses", -1).limit(100):
        items.append(_serialize(doc))
    return items


@router.get("/templates/{template_id}")
async def get_public_template(template_id: str):
    try:
        oid = ObjectId(template_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid template id")
    doc = await db.templates.find_one({"_id": oid, "public": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Template not found or private")
    return _serialize(doc)
