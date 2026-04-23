"""Page analytics — simple view counter for published pages."""
from fastapi import APIRouter, Depends, HTTPException, Request
from bson import ObjectId
from datetime import datetime, timezone

from core import db, get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/pageview/{page_id}")
async def record_pageview(page_id: str, request: Request):
    """Increment view count for a published page. Public — no auth required."""
    try:
        oid = ObjectId(page_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid page id")
    page = await db.pages.find_one({"_id": oid, "published": True}, {"_id": 1})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found or not published")
    referrer = request.headers.get("referer", "")[:500] or "direct"
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    await db.pages.update_one({"_id": oid}, {"$inc": {"views": 1}})
    await db.pageviews.insert_one({
        "page_id": str(oid),
        "ts": datetime.now(timezone.utc).isoformat(),
        "day": day,
        "referrer": referrer,
        "ip_hash": hash(request.client.host) & 0xffffffff,
    })
    return {"ok": True}


@router.get("/page/{page_id}")
async def get_page_analytics(page_id: str, user: dict = Depends(get_current_user)):
    """Owner-only: return total views + 14-day breakdown + top referrers."""
    try:
        oid = ObjectId(page_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid page id")
    page = await db.pages.find_one({"_id": oid, "user_id": user["id"]}, {"_id": 1, "views": 1, "title": 1})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    # Last 14 days views by day
    pipeline_days = [
        {"$match": {"page_id": str(oid)}},
        {"$group": {"_id": "$day", "count": {"$sum": 1}}},
        {"$sort": {"_id": -1}},
        {"$limit": 14},
    ]
    days = [{"day": d["_id"], "count": d["count"]} async for d in db.pageviews.aggregate(pipeline_days)]

    # Top 10 referrers
    pipeline_ref = [
        {"$match": {"page_id": str(oid)}},
        {"$group": {"_id": "$referrer", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    referrers = [{"referrer": d["_id"], "count": d["count"]} async for d in db.pageviews.aggregate(pipeline_ref)]

    return {
        "page_id": str(oid),
        "title": page.get("title", ""),
        "total_views": page.get("views", 0),
        "days": days,
        "referrers": referrers,
    }
