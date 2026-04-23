from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, List, Optional, Any, Dict
from bson import ObjectId
import os
import logging
import uuid
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from slugify import slugify

# ─── ObjectId helper ───────────────────────────────────────────────────────────
def coerce_objectid(v):
    if isinstance(v, ObjectId):
        return str(v)
    return v

PyObjectId = Annotated[str, BeforeValidator(coerce_objectid)]

# ─── MongoDB ───────────────────────────────────────────────────────────────────
mongo_url = os.environ["MONGO_URL"]
db_name   = os.environ["DB_NAME"]
client    = AsyncIOMotorClient(mongo_url)
db        = client[db_name]

# ─── JWT helpers ───────────────────────────────────────────────────────────────
JWT_SECRET    = os.environ.get("JWT_SECRET", "stakked-dev-secret-key-change-in-prod")
JWT_ALGORITHM = "HS256"

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
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

# ─── Models ────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    artist_type: Optional[str] = "creator"

class LoginRequest(BaseModel):
    email: str
    password: str

class PageElement(BaseModel):
    id: str
    type: str
    x: float = 0
    y: float = 0
    w: float = 200
    h: float = 100
    content: Dict[str, Any] = {}
    name: str = "Element"
    zIndex: int = 0
    locked: bool = False
    visible: bool = True
    animations: List[Dict[str, Any]] = []

class PageCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    theme: str = "neon"
    mode: str = "dark"
    page_type: Optional[str] = "custom"
    elements: List[PageElement] = []
    breakpoint_default: str = "desktop"

class PageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    theme: Optional[str] = None
    mode: Optional[str] = None
    elements: Optional[List[Any]] = None
    breakpoint_default: Optional[str] = None
    published: Optional[bool] = None
    slug: Optional[str] = None

class AiRequest(BaseModel):
    prompt: str
    page_type: Optional[str] = "music"
    theme: Optional[str] = "neon"

class AiSummaryRequest(BaseModel):
    elements: List[Dict[str, Any]]
    title: str
    theme: str

# ─── App ───────────────────────────────────────────────────────────────────────
app    = FastAPI(title="Stakked API")
router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.pages.create_index("user_id")
    await db.pages.create_index([("slug", 1), ("user_id", 1)])
    await db.login_attempts.create_index("identifier")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@stakked.io")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "_id": ObjectId(),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "artist_type": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Write test credentials
    import pathlib
    pathlib.Path("/app/memory").mkdir(exist_ok=True)
    creds = f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n"
    pathlib.Path("/app/memory/test_credentials.md").write_text(creds)

@app.on_event("shutdown")
async def shutdown():
    client.close()

# ─── Auth ──────────────────────────────────────────────────────────────────────
@router.post("/auth/register")
async def register(body: RegisterRequest, response: Response):
    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "_id": ObjectId(),
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name,
        "role": "user",
        "artist_type": body.artist_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    uid = str(user_doc["_id"])
    access_token  = create_access_token(uid, email)
    refresh_token = create_refresh_token(uid)
    response.set_cookie("access_token",  access_token,  httponly=True, secure=False, samesite="lax", max_age=3600,   path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": uid, "email": email, "name": body.name, "role": "user", "artist_type": body.artist_type}

@router.post("/auth/login")
async def login(body: LoginRequest, response: Response, request: Request):
    email = body.email.lower().strip()
    ip = request.client.host
    key = f"{ip}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": key})
    if attempts and attempts.get("count", 0) >= 5:
        locked_at = datetime.fromisoformat(attempts["last_attempt"])
        if datetime.now(timezone.utc) - locked_at < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": key})

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": key},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    await db.login_attempts.delete_one({"identifier": key})
    uid = str(user["_id"])
    access_token  = create_access_token(uid, email)
    refresh_token = create_refresh_token(uid)
    response.set_cookie("access_token",  access_token,  httponly=True, secure=False, samesite="lax", max_age=3600,   path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": uid, "email": email, "name": user.get("name",""), "role": user.get("role","user"), "artist_type": user.get("artist_type","creator")}

@router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}

@router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

@router.post("/auth/refresh")
async def refresh_token_endpoint(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        uid = payload["sub"]
        user = await db.users.find_one({"_id": ObjectId(uid)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access_token = create_access_token(uid, user["email"])
        response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ─── Pages ─────────────────────────────────────────────────────────────────────
def serialize_page(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.get("/pages")
async def list_pages(user: dict = Depends(get_current_user)):
    pages = await db.pages.find({"user_id": user["id"]}, {"_id": 1, "title": 1, "slug": 1, "theme": 1, "mode": 1, "published": 1, "created_at": 1, "updated_at": 1, "page_type": 1, "description": 1}).to_list(200)
    return [serialize_page(p) for p in pages]

@router.post("/pages")
async def create_page(body: PageCreate, user: dict = Depends(get_current_user)):
    base_slug = slugify(body.title) or "untitled"
    slug = base_slug
    count = 0
    while await db.pages.find_one({"user_id": user["id"], "slug": slug}):
        count += 1
        slug = f"{base_slug}-{count}"
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "_id": ObjectId(),
        "user_id": user["id"],
        "title": body.title,
        "description": body.description,
        "theme": body.theme,
        "mode": body.mode,
        "page_type": body.page_type,
        "elements": [e.model_dump() for e in body.elements],
        "breakpoint_default": body.breakpoint_default,
        "published": False,
        "slug": slug,
        "created_at": now,
        "updated_at": now,
    }
    await db.pages.insert_one(doc)
    return serialize_page(doc)

@router.get("/pages/published")
async def list_published_pages():
    pages = await db.pages.find({"published": True}, {"_id": 1, "title": 1, "slug": 1, "theme": 1, "mode": 1, "page_type": 1, "description": 1, "user_id": 1, "created_at": 1}).to_list(100)
    result = []
    for p in pages:
        p["id"] = str(p.pop("_id"))
        user = await db.users.find_one({"_id": ObjectId(p["user_id"])}, {"name": 1, "artist_type": 1})
        if user:
            p["author_name"] = user.get("name", "Creator")
            p["author_type"] = user.get("artist_type", "creator")
        result.append(p)
    return result

@router.get("/pages/{page_id}")
async def get_page(page_id: str, user: dict = Depends(get_current_user)):
    try:
        doc = await db.pages.find_one({"_id": ObjectId(page_id), "user_id": user["id"]})
    except Exception:
        raise HTTPException(status_code=404, detail="Page not found")
    if not doc:
        raise HTTPException(status_code=404, detail="Page not found")
    return serialize_page(doc)

@router.put("/pages/{page_id}")
async def update_page(page_id: str, body: PageUpdate, user: dict = Depends(get_current_user)):
    try:
        existing = await db.pages.find_one({"_id": ObjectId(page_id), "user_id": user["id"]})
    except Exception:
        raise HTTPException(status_code=404, detail="Page not found")
    if not existing:
        raise HTTPException(status_code=404, detail="Page not found")
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if "elements" in update and update["elements"] is None:
        del update["elements"]
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    if "published" in update and update["published"] and not existing.get("published"):
        update["published_at"] = datetime.now(timezone.utc).isoformat()
    if "slug" in update:
        slug = slugify(update["slug"]) or slugify(existing.get("title", "untitled"))
        existing_slug = await db.pages.find_one({"user_id": user["id"], "slug": slug, "_id": {"$ne": ObjectId(page_id)}})
        if existing_slug:
            raise HTTPException(status_code=400, detail="Slug already in use")
        update["slug"] = slug
    await db.pages.update_one({"_id": ObjectId(page_id)}, {"$set": update})
    doc = await db.pages.find_one({"_id": ObjectId(page_id)})
    return serialize_page(doc)

@router.delete("/pages/{page_id}")
async def delete_page(page_id: str, user: dict = Depends(get_current_user)):
    try:
        result = await db.pages.delete_one({"_id": ObjectId(page_id), "user_id": user["id"]})
    except Exception:
        raise HTTPException(status_code=404, detail="Page not found")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Deleted"}

@router.get("/p/{username}/{slug}")
async def get_published_page(username: str, slug: str):
    user = await db.users.find_one({"name": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    doc = await db.pages.find_one({"user_id": str(user["_id"]), "slug": slug, "published": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Page not found or not published")
    doc["id"] = str(doc.pop("_id"))
    doc["author_name"] = user.get("name", "Creator")
    return doc

# ─── Themes ────────────────────────────────────────────────────────────────────
THEMES = [
    {"id": "neon",   "name": "Neon",   "dark": {"accent": "#ff2e9a", "accent_ink": "#ffffff"}, "light": {"accent": "#e0006a", "accent_ink": "#ffffff"}},
    {"id": "ghost",  "name": "Ghost",  "dark": {"accent": "#f2f2f2", "accent_ink": "#0c0c0d"}, "light": {"accent": "#0f0f10", "accent_ink": "#ffffff"}},
    {"id": "brutal", "name": "Brutal", "dark": {"accent": "#ffee00", "accent_ink": "#000000"}, "light": {"accent": "#ff0000", "accent_ink": "#ffffff"}},
    {"id": "paper",  "name": "Paper",  "dark": {"accent": "#d4a574", "accent_ink": "#000000"}, "light": {"accent": "#a06b2a", "accent_ink": "#ffffff"}},
    {"id": "sunset", "name": "Sunset", "dark": {"accent": "#ff8e53", "accent_ink": "#000000"}, "light": {"accent": "#e55a2b", "accent_ink": "#ffffff"}},
]

@router.get("/themes")
async def get_themes():
    return THEMES

# ─── AI ────────────────────────────────────────────────────────────────────────
@router.post("/ai/generate-layout")
async def generate_layout(body: AiRequest, user: dict = Depends(get_current_user)):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        api_key = os.environ.get("EMERGENT_LLM_KEY", "")
        chat = LlmChat(
            api_key=api_key,
            session_id=f"layout-{user['id']}-{uuid.uuid4()}",
            system_message="""You are a creative layout designer for Stakked, a drag-and-drop page builder for artists.
            Generate page elements in JSON format. Each element has: id, type, x, y, w, h, content, name.
            Types: text, image, button, shape, music, video, social, divider, gallery, icon
            Return ONLY a valid JSON array of elements. No markdown, no explanation.
            Canvas is 800px wide, unlimited height. Use pixel coordinates.
            Place elements thoughtfully for the artist's purpose."""
        ).with_model("gemini", "gemini-2.5-flash")

        msg = UserMessage(text=f"Create a {body.page_type} page layout for: {body.prompt}. Theme: {body.theme}. Return JSON array of elements.")
        response = await chat.send_message(msg)

        # Parse response
        import json, re
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            elements = json.loads(json_match.group())
            # Ensure each element has required fields
            for i, el in enumerate(elements):
                el.setdefault("id", f"el-{i}-{uuid.uuid4().hex[:6]}")
                el.setdefault("zIndex", i)
                el.setdefault("locked", False)
                el.setdefault("visible", True)
                el.setdefault("animations", [])
            return {"elements": elements, "prompt": body.prompt}
        return {"elements": [], "error": "Could not parse layout"}
    except Exception as e:
        logger.error(f"AI layout error: {e}")
        return {"elements": [], "error": str(e)}

@router.post("/ai/page-summary")
async def page_summary(body: AiSummaryRequest, user: dict = Depends(get_current_user)):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        api_key = os.environ.get("EMERGENT_LLM_KEY", "")
        chat = LlmChat(
            api_key=api_key,
            session_id=f"summary-{user['id']}-{uuid.uuid4()}",
            system_message="You are an AI assistant for Stakked, a creative page builder. Provide concise, engaging descriptions of creative pages."
        ).with_model("gemini", "gemini-2.5-flash")

        elements_desc = ", ".join([f"{el.get('name','element')} ({el.get('type','unknown')})" for el in body.elements[:10]])
        msg = UserMessage(text=f"Describe this artist page in 2-3 sentences:\nTitle: {body.title}\nTheme: {body.theme}\nElements: {elements_desc}")
        response = await chat.send_message(msg)
        return {"summary": response}
    except Exception as e:
        return {"summary": f"A creative {body.theme}-themed page titled '{body.title}'."}

@router.post("/ai/animation-suggestions")
async def animation_suggestions(body: dict, user: dict = Depends(get_current_user)):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        api_key = os.environ.get("EMERGENT_LLM_KEY", "")
        chat = LlmChat(
            api_key=api_key,
            session_id=f"anim-{user['id']}-{uuid.uuid4()}",
            system_message="You are an animation expert for web pages. Suggest CSS animation names and properties. Return JSON array."
        ).with_model("gemini", "gemini-2.5-flash")

        element_type = body.get("element_type", "text")
        msg = UserMessage(text=f"Suggest 3 CSS animations for a {element_type} element on an artist page. Return JSON: [{{'name':..., 'description':..., 'css_class':...}}]")
        response = await chat.send_message(msg)
        import json, re
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            return {"suggestions": json.loads(json_match.group())}
        return {"suggestions": [{"name": "Fade In", "description": "Smooth fade in", "css_class": "animate-fadeIn"}]}
    except Exception as e:
        return {"suggestions": []}

@router.get("/")
async def root():
    return {"message": "Stakked API", "version": "1.0.0"}

app.include_router(router)
