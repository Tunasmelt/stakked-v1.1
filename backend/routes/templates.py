"""Templates: save/list/use/delete/publish-to-marketplace."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from bson import ObjectId
import uuid
from slugify import slugify

from core import db, get_current_user

router = APIRouter(prefix="/templates", tags=["templates"])


class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    theme: str = "brutal"
    mode: str = "dark"
    elements: List[Dict[str, Any]] = []
    canvas_width: int = 1440
    canvas_height: int = 2500
    category: Optional[str] = "general"


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.post("")
async def create_template(body: TemplateCreate, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "_id": ObjectId(),
        "user_id": user["id"],
        "author_name": user.get("name", "Creator"),
        "name": body.name,
        "description": body.description,
        "theme": body.theme,
        "mode": body.mode,
        "elements": body.elements,
        "canvas_width": body.canvas_width,
        "canvas_height": body.canvas_height,
        "category": body.category,
        "public": False,
        "uses": 0,
        "created_at": now,
    }
    await db.templates.insert_one(doc)
    return _serialize(doc)


@router.get("")
async def list_templates(user: dict = Depends(get_current_user)):
    items = []
    async for doc in db.templates.find({"user_id": user["id"]}).sort("created_at", -1):
        items.append(_serialize(doc))
    return items


@router.delete("/{template_id}")
async def delete_template(template_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(template_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid template id")
    res = await db.templates.delete_one({"_id": oid, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"ok": True}


@router.post("/{template_id}/use")
async def use_template(template_id: str, body: Dict[str, Any], user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(template_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid template id")
    # Public templates are usable by anyone; private templates only by owner.
    tpl = await db.templates.find_one({"_id": oid, "$or": [{"user_id": user["id"]}, {"public": True}]})
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
    title = body.get("title") or tpl["name"]
    now = datetime.now(timezone.utc).isoformat()
    sub_id = f"sp-{uuid.uuid4().hex[:8]}"
    sub_pages = [{
        "id": sub_id, "name": "Home", "slug": "home",
        "elements": tpl.get("elements", []),
        "canvas_width": tpl.get("canvas_width", 1440),
        "canvas_height": tpl.get("canvas_height", 2500),
        "padding": 0, "transition": "none",
    }]
    page_doc = {
        "_id": ObjectId(),
        "user_id": user["id"],
        "title": title,
        "description": tpl.get("description", ""),
        "theme": tpl.get("theme", "brutal"),
        "mode": tpl.get("mode", "dark"),
        "elements": tpl.get("elements", []),
        "sub_pages": sub_pages,
        "canvas_width": tpl.get("canvas_width", 1440),
        "canvas_height": tpl.get("canvas_height", 2500),
        "published": False,
        "slug": slugify(title) or "untitled",
        "workflow": {"nodes": [], "edges": []},
        "created_at": now,
        "updated_at": now,
    }
    await db.pages.insert_one(page_doc)
    await db.templates.update_one({"_id": oid}, {"$inc": {"uses": 1}})
    page_doc["id"] = str(page_doc.pop("_id"))
    return page_doc


@router.post("/{template_id}/publish")
async def toggle_publish_template(template_id: str, body: Dict[str, Any], user: dict = Depends(get_current_user)):
    """Mark a template as public (discoverable in /marketplace). Only owner can toggle."""
    try:
        oid = ObjectId(template_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid template id")
    make_public = bool(body.get("public", True))
    res = await db.templates.update_one(
        {"_id": oid, "user_id": user["id"]},
        {"$set": {"public": make_public}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"ok": True, "public": make_public}
