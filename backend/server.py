from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'defense-connect-secret-key-2024')
JWT_ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    user_type: str = "buyer"  # buyer, supplier

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    image_url: str
    active_suppliers: int = 0
    product_count: int = 0

class Supplier(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    tagline: str
    description: str
    logo_url: str
    country: str
    rating: float = 0.0
    review_count: int = 0
    verified: bool = False
    capabilities: List[str] = []
    active_products: int = 0
    countries_served: int = 0
    certifications: List[str] = []
    activity_score: float = 0.0

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    short_description: str
    description: str
    image_url: str
    category_id: str
    category_name: str
    supplier_id: str
    supplier_name: str
    country: str
    rating: float = 0.0
    review_count: int = 0
    specifications: dict = {}
    certifications: List[str] = []
    in_stock: bool = True
    featured: bool = False

class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    company_name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    attachment_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactCreate(BaseModel):
    full_name: str
    company_name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    attachment_url: Optional[str] = None

class SupplierRegistration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    supplier_type: str
    contact_person: str
    email: EmailStr
    phone: str
    license_number: str
    vat_number: Optional[str] = None
    trade_license_url: Optional[str] = None
    trade_license_expiry: Optional[str] = None
    vat_certificate_url: Optional[str] = None
    vat_certificate_expiry: Optional[str] = None
    additional_certifications: List[str] = []
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SupplierRegistrationCreate(BaseModel):
    company_name: str
    supplier_type: str
    contact_person: str
    email: EmailStr
    phone: str
    license_number: str
    vat_number: Optional[str] = None
    trade_license_url: Optional[str] = None
    trade_license_expiry: Optional[str] = None
    vat_certificate_url: Optional[str] = None
    vat_certificate_expiry: Optional[str] = None
    additional_certifications: List[str] = []

class SearchQuery(BaseModel):
    query: str
    category: Optional[str] = None

class SearchSuggestion(BaseModel):
    type: str  # product, supplier, category
    id: str
    name: str
    description: str
    score: float

class SearchResult(BaseModel):
    products: List[Product]
    suppliers: List[Supplier]
    categories: List[Category]

class InquiryCreate(BaseModel):
    product_id: Optional[str] = None
    supplier_id: str
    message: str
    full_name: str
    email: EmailStr
    company_name: Optional[str] = None

# ===================== AUTH HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(token: str = None):
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        return user
    except:
        return None

# ===================== AUTH ROUTES =====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "company_name": user_data.company_name,
        "phone": user_data.phone,
        "user_type": user_data.user_type,
        "password_hash": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        phone=user_data.phone,
        user_type=user_data.user_type,
        created_at=datetime.fromisoformat(user_doc['created_at'])
    )
    return TokenResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        company_name=user.get("company_name"),
        phone=user.get("phone"),
        user_type=user.get("user_type", "buyer"),
        created_at=created_at
    )
    return TokenResponse(token=token, user=user_response)

# ===================== CATEGORY ROUTES =====================

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

@api_router.get("/categories/{slug}", response_model=Category)
async def get_category(slug: str):
    category = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

# ===================== PRODUCT ROUTES =====================

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    supplier: Optional[str] = None,
    min_rating: Optional[float] = None,
    in_stock: Optional[bool] = None,
    featured: Optional[bool] = None,
    limit: int = 50
):
    query = {}
    if category:
        query["category_id"] = category
    if supplier:
        query["supplier_id"] = supplier
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    if in_stock is not None:
        query["in_stock"] = in_stock
    if featured is not None:
        query["featured"] = featured
    
    products = await db.products.find(query, {"_id": 0}).to_list(limit)
    return products

@api_router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# ===================== SUPPLIER ROUTES =====================

@api_router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers(
    verified: Optional[bool] = None,
    min_rating: Optional[float] = None,
    country: Optional[str] = None,
    limit: int = 50
):
    query = {}
    if verified is not None:
        query["verified"] = verified
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    if country:
        query["country"] = country
    
    suppliers = await db.suppliers.find(query, {"_id": 0}).to_list(limit)
    return suppliers

@api_router.get("/suppliers/{slug}", response_model=Supplier)
async def get_supplier(slug: str):
    supplier = await db.suppliers.find_one({"slug": slug}, {"_id": 0})
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

# ===================== AI SEARCH ROUTES =====================

@api_router.get("/search/suggestions")
async def get_search_suggestions(q: str):
    if len(q) < 2:
        return {"suggestions": []}
    
    suggestions = []
    
    # Search products
    products = await db.products.find(
        {"$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]},
        {"_id": 0}
    ).to_list(5)
    
    for p in products:
        keyword_score = 0.5 if q.lower() in p.get("name", "").lower() else 0.25
        rating_score = (p.get("rating", 0) / 5) * 0.15
        supplier_activity = 0.15
        score = keyword_score + rating_score + supplier_activity
        suggestions.append({
            "type": "product",
            "id": p["id"],
            "name": p["name"],
            "description": p.get("short_description", "")[:100],
            "score": score
        })
    
    # Search suppliers
    suppliers = await db.suppliers.find(
        {"$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]},
        {"_id": 0}
    ).to_list(5)
    
    for s in suppliers:
        keyword_score = 0.5 if q.lower() in s.get("name", "").lower() else 0.25
        rating_score = (s.get("rating", 0) / 5) * 0.20
        activity_score = s.get("activity_score", 0.5) * 0.15
        score = keyword_score + rating_score + activity_score
        suggestions.append({
            "type": "supplier",
            "id": s["id"],
            "name": s["name"],
            "description": s.get("tagline", "")[:100],
            "score": score
        })
    
    # Search categories
    categories = await db.categories.find(
        {"$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]},
        {"_id": 0}
    ).to_list(5)
    
    for c in categories:
        keyword_score = 0.5 if q.lower() in c.get("name", "").lower() else 0.25
        suggestions.append({
            "type": "category",
            "id": c["id"],
            "name": c["name"],
            "description": c.get("description", "")[:100],
            "score": keyword_score + 0.2
        })
    
    # Sort by score
    suggestions.sort(key=lambda x: x["score"], reverse=True)
    
    return {"suggestions": suggestions[:10]}

@api_router.post("/search")
async def search(search_query: SearchQuery):
    q = search_query.query
    
    product_query = {"$or": [
        {"name": {"$regex": q, "$options": "i"}},
        {"description": {"$regex": q, "$options": "i"}},
        {"short_description": {"$regex": q, "$options": "i"}}
    ]}
    if search_query.category:
        product_query["category_id"] = search_query.category
    
    products = await db.products.find(product_query, {"_id": 0}).to_list(50)
    suppliers = await db.suppliers.find(
        {"$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]},
        {"_id": 0}
    ).to_list(20)
    categories = await db.categories.find(
        {"$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]},
        {"_id": 0}
    ).to_list(10)
    
    return {
        "products": products,
        "suppliers": suppliers,
        "categories": categories
    }

@api_router.post("/search/ai-suggestions")
async def ai_search_suggestions(search_query: SearchQuery):
    """Use AI to provide intelligent search suggestions"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return {"suggestions": [], "ai_summary": ""}
        
        # Get sample data for context
        products = await db.products.find({}, {"_id": 0, "name": 1, "category_name": 1}).to_list(20)
        categories = await db.categories.find({}, {"_id": 0, "name": 1}).to_list(10)
        
        product_names = [p["name"] for p in products]
        category_names = [c["name"] for c in categories]
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"search-{uuid.uuid4()}",
            system_message="""You are a defense industry search assistant. Help users find relevant products, suppliers, and categories.
            Available categories: """ + ", ".join(category_names) + """
            Sample products: """ + ", ".join(product_names[:10])
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(
            text=f"User is searching for: {search_query.query}. Provide a brief helpful summary (1-2 sentences) about what they might be looking for in a defense marketplace context."
        )
        
        response = await chat.send_message(user_message)
        
        return {"ai_summary": response}
    except Exception as e:
        logger.error(f"AI search error: {e}")
        return {"ai_summary": ""}

# ===================== CONTACT ROUTES =====================

@api_router.post("/contact", response_model=ContactSubmission)
async def submit_contact(contact: ContactCreate):
    contact_doc = ContactSubmission(
        full_name=contact.full_name,
        company_name=contact.company_name,
        email=contact.email,
        phone=contact.phone,
        subject=contact.subject,
        message=contact.message,
        attachment_url=contact.attachment_url
    )
    doc = contact_doc.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contacts.insert_one(doc)
    return contact_doc

@api_router.post("/inquiry")
async def submit_inquiry(inquiry: InquiryCreate):
    inquiry_doc = {
        "id": str(uuid.uuid4()),
        "product_id": inquiry.product_id,
        "supplier_id": inquiry.supplier_id,
        "message": inquiry.message,
        "full_name": inquiry.full_name,
        "email": inquiry.email,
        "company_name": inquiry.company_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending"
    }
    await db.inquiries.insert_one(inquiry_doc)
    return {"message": "Inquiry submitted successfully", "id": inquiry_doc["id"]}

# ===================== SUPPLIER REGISTRATION =====================

@api_router.post("/supplier-registration", response_model=SupplierRegistration)
async def register_supplier(registration: SupplierRegistrationCreate):
    existing = await db.supplier_registrations.find_one({"email": registration.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    reg_doc = SupplierRegistration(**registration.model_dump())
    doc = reg_doc.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.supplier_registrations.insert_one(doc)
    return reg_doc

# ===================== STATS =====================

@api_router.get("/stats")
async def get_stats():
    categories_count = await db.categories.count_documents({})
    products_count = await db.products.count_documents({})
    suppliers_count = await db.suppliers.count_documents({"verified": True})
    
    return {
        "categories": categories_count or 40,
        "components": products_count or 400,
        "suppliers": suppliers_count or 50
    }

# ===================== SEED DATA =====================

@api_router.post("/seed")
async def seed_database():
    """Seed database with demo data"""
    
    # Check if already seeded
    existing = await db.categories.count_documents({})
    if existing > 0:
        return {"message": "Database already seeded"}
    
    # Categories
    categories = [
        {
            "id": str(uuid.uuid4()),
            "name": "Electronics",
            "slug": "electronics",
            "description": "Mission-critical electronic components, circuit boards, and integrated systems for defense applications.",
            "image_url": "https://images.pexels.com/photos/163170/board-printed-circuit-board-computer-electronics-163170.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "active_suppliers": 15,
            "product_count": 89
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Armored Systems",
            "slug": "armored-systems",
            "description": "Armored vehicles, protective systems, and ballistic solutions for ground operations.",
            "image_url": "https://images.pexels.com/photos/12112278/pexels-photo-12112278.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "active_suppliers": 12,
            "product_count": 56
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Weapons & Munitions",
            "slug": "weapons-munitions",
            "description": "Precision weapons systems, ammunition, and ordnance for tactical deployment.",
            "image_url": "https://images.unsplash.com/photo-1771889928359-175bfe7f5ec7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMHJvY2tldCUyMGxhdW5jaGVyfGVufDB8fHx8MTc3MjA3OTU4NXww&ixlib=rb-4.1.0&q=85",
            "active_suppliers": 8,
            "product_count": 43
        },
        {
            "id": str(uuid.uuid4()),
            "name": "UAV & Aerospace",
            "slug": "uav-aerospace",
            "description": "High-performance propulsion, avionics, and composite systems engineered for airborne platforms.",
            "image_url": "https://images.pexels.com/photos/17854251/pexels-photo-17854251.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "active_suppliers": 18,
            "product_count": 72
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Communications",
            "slug": "communications",
            "description": "Secure communication systems, encrypted radios, and tactical networking solutions.",
            "image_url": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "active_suppliers": 14,
            "product_count": 67
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Surveillance & Optics",
            "slug": "surveillance-optics",
            "description": "Advanced surveillance equipment, thermal imaging, and precision optics systems.",
            "image_url": "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "active_suppliers": 11,
            "product_count": 58
        }
    ]
    
    # Suppliers
    suppliers = [
        {
            "id": str(uuid.uuid4()),
            "name": "Sentinel Defense Systems",
            "slug": "sentinel-defense-systems",
            "tagline": "Precision Engineering for Critical Missions",
            "description": "Sentinel Defense Systems is a leading manufacturer of armored vehicle components and ballistic protection systems with over 30 years of experience serving defense forces worldwide.",
            "logo_url": "https://images.unsplash.com/photo-1738162837627-5794e6563cac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwY25jJTIwbWFjaGluZXJ5fGVufDB8fHx8MTc3MjA3OTU4N3ww&ixlib=rb-4.1.0&q=85",
            "country": "USA",
            "rating": 4.8,
            "review_count": 127,
            "verified": True,
            "capabilities": ["Armored Vehicles", "Ballistic Protection", "Vehicle Upgrades"],
            "active_products": 45,
            "countries_served": 23,
            "certifications": ["ISO 9001", "ITAR Compliant", "NATO Certified"],
            "activity_score": 0.92
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Orion Dynamics",
            "slug": "orion-dynamics",
            "tagline": "Precision Engineering for Modern Defense Platforms",
            "description": "Orion Dynamics specializes in propulsion engineering, avionics integration, and lightweight composite manufacturing for airborne and tactical defense platforms.",
            "logo_url": "https://images.pexels.com/photos/33748032/pexels-photo-33748032.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "country": "UAE",
            "rating": 4.6,
            "review_count": 89,
            "verified": True,
            "capabilities": ["Propulsion Engineering", "Avionics Systems", "Composite Airframes", "Defense Export Compliance"],
            "active_products": 32,
            "countries_served": 14,
            "certifications": ["ISO 9001", "NATO Standardization Compliant", "Defense Export Clearance Approved"],
            "activity_score": 0.88
        },
        {
            "id": str(uuid.uuid4()),
            "name": "TechForge Electronics",
            "slug": "techforge-electronics",
            "tagline": "Advanced Electronics for Defense Applications",
            "description": "TechForge Electronics delivers cutting-edge electronic components, circuit assemblies, and integrated defense systems to military and government clients globally.",
            "logo_url": "https://images.pexels.com/photos/163170/board-printed-circuit-board-computer-electronics-163170.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "country": "Germany",
            "rating": 4.7,
            "review_count": 156,
            "verified": True,
            "capabilities": ["Circuit Design", "Embedded Systems", "Signal Processing", "EMC Testing"],
            "active_products": 78,
            "countries_served": 28,
            "certifications": ["ISO 9001", "ISO 14001", "AQAP 2110"],
            "activity_score": 0.95
        }
    ]
    
    # Products
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Rocket Launcher M270 MLRS",
            "slug": "rocket-launcher-m270-mlrs",
            "short_description": "Engineered for high-impact tactical deployment with precision targeting and modular integration capability.",
            "description": "The M270 Multiple Launch Rocket System is a highly mobile, armored platform capable of delivering devastating firepower. It features automated reload capabilities, advanced fire control systems, and NATO-standard ammunition compatibility.",
            "image_url": "https://images.unsplash.com/photo-1771889928359-175bfe7f5ec7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMHJvY2tldCUyMGxhdW5jaGVyfGVufDB8fHx8MTc3MjA3OTU4NXww&ixlib=rb-4.1.0&q=85",
            "category_id": "",
            "category_name": "Weapons & Munitions",
            "supplier_id": "",
            "supplier_name": "Sentinel Defense Systems",
            "country": "USA",
            "rating": 4.9,
            "review_count": 34,
            "specifications": {
                "Range": "Up to 300km (ATACMS)",
                "Reload Time": "Under 5 minutes",
                "Crew": "3 personnel",
                "Weight": "24,756 kg",
                "Max Speed": "64 km/h"
            },
            "certifications": ["NATO STANAG", "MIL-STD-810G"],
            "in_stock": True,
            "featured": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Falcon-X Tactical UAV Propulsion System",
            "slug": "falcon-x-tactical-uav-propulsion",
            "short_description": "High-efficiency propulsion engineered for endurance, reliability, and precision flight control.",
            "description": "The Falcon-X propulsion system is engineered for tactical UAV platforms requiring extended operational range and adaptive thrust control. Built for reliability under extreme operational conditions, it integrates AI-regulated fuel mapping and lightweight composite housing.",
            "image_url": "https://images.pexels.com/photos/17854251/pexels-photo-17854251.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category_id": "",
            "category_name": "UAV & Aerospace",
            "supplier_id": "",
            "supplier_name": "Orion Dynamics",
            "country": "UAE",
            "rating": 4.6,
            "review_count": 21,
            "specifications": {
                "Thrust Capacity": "18 kN",
                "Fuel Type": "Hybrid-compatible",
                "Weight": "42 kg",
                "Operating Temperature": "-40°C to +55°C",
                "Integration Compatibility": "NATO-compliant"
            },
            "certifications": ["ISO 9001", "NATO Standardization Compliant", "Defense Export Clearance Approved"],
            "in_stock": True,
            "featured": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Titan-7 Armored Hull Assembly",
            "slug": "titan-7-armored-hull",
            "short_description": "Modular armored hull system with multi-threat protection rating.",
            "description": "The Titan-7 represents the pinnacle of armored vehicle protection technology. Featuring composite armor matrices, mine blast attenuation systems, and modular upgrade capability.",
            "image_url": "https://images.pexels.com/photos/12112278/pexels-photo-12112278.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category_id": "",
            "category_name": "Armored Systems",
            "supplier_id": "",
            "supplier_name": "Sentinel Defense Systems",
            "country": "USA",
            "rating": 4.8,
            "review_count": 42,
            "specifications": {
                "Protection Level": "STANAG 4569 Level 6",
                "Weight": "2,400 kg",
                "Material": "Composite Ceramic Matrix",
                "Mine Protection": "8kg AT Mine",
                "Service Life": "20+ years"
            },
            "certifications": ["STANAG 4569", "AEP-55", "MIL-STD-662"],
            "in_stock": True,
            "featured": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "SecureLink Tactical Radio System",
            "slug": "securelink-tactical-radio",
            "short_description": "Encrypted multi-band tactical communication system with mesh networking.",
            "description": "SecureLink provides military-grade encrypted communications across multiple frequency bands. Features automatic frequency hopping, mesh network capability, and GPS integration.",
            "image_url": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category_id": "",
            "category_name": "Communications",
            "supplier_id": "",
            "supplier_name": "TechForge Electronics",
            "country": "Germany",
            "rating": 4.7,
            "review_count": 63,
            "specifications": {
                "Frequency Range": "30 MHz - 512 MHz",
                "Encryption": "AES-256",
                "Battery Life": "24 hours continuous",
                "Range": "Up to 30 km (line of sight)",
                "Weight": "1.2 kg"
            },
            "certifications": ["TEMPEST", "MIL-STD-188", "NATO STANAG 4609"],
            "in_stock": True,
            "featured": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hawk-Eye Thermal Imaging System",
            "slug": "hawk-eye-thermal-imaging",
            "short_description": "Long-range thermal detection and targeting system for surveillance operations.",
            "description": "The Hawk-Eye system provides unmatched thermal imaging capability for day/night operations. Features advanced image processing, target tracking, and integration with fire control systems.",
            "image_url": "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category_id": "",
            "category_name": "Surveillance & Optics",
            "supplier_id": "",
            "supplier_name": "TechForge Electronics",
            "country": "Germany",
            "rating": 4.5,
            "review_count": 38,
            "specifications": {
                "Detection Range": "10+ km (vehicle)",
                "Resolution": "640x480 HD",
                "Field of View": "24° x 18°",
                "Operating Temperature": "-40°C to +55°C",
                "Weight": "3.5 kg"
            },
            "certifications": ["MIL-STD-810G", "IP67", "EMC Compliant"],
            "in_stock": True,
            "featured": False
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Defender PCB Assembly Kit",
            "slug": "defender-pcb-assembly",
            "short_description": "Ruggedized PCB assemblies for defense electronic systems.",
            "description": "Military-specification printed circuit board assemblies designed for harsh environments. Features conformal coating, vibration resistance, and extended temperature range operation.",
            "image_url": "https://images.pexels.com/photos/163170/board-printed-circuit-board-computer-electronics-163170.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "category_id": "",
            "category_name": "Electronics",
            "supplier_id": "",
            "supplier_name": "TechForge Electronics",
            "country": "Germany",
            "rating": 4.6,
            "review_count": 89,
            "specifications": {
                "Layer Count": "Up to 24 layers",
                "Material": "FR-4 / Polyimide",
                "Coating": "MIL-I-46058 Conformal",
                "Temperature Range": "-55°C to +125°C",
                "IPC Class": "Class 3 (Military)"
            },
            "certifications": ["IPC-A-610 Class 3", "AS9100D", "ITAR Registered"],
            "in_stock": True,
            "featured": False
        }
    ]
    
    # Link products to categories and suppliers
    category_map = {c["name"]: c["id"] for c in categories}
    supplier_map = {s["name"]: s["id"] for s in suppliers}
    
    for product in products:
        product["category_id"] = category_map.get(product["category_name"], "")
        product["supplier_id"] = supplier_map.get(product["supplier_name"], "")
    
    # Insert all data
    await db.categories.insert_many(categories)
    await db.suppliers.insert_many(suppliers)
    await db.products.insert_many(products)
    
    return {"message": "Database seeded successfully", "categories": len(categories), "suppliers": len(suppliers), "products": len(products)}

# ===================== ROOT =====================

@api_router.get("/")
async def root():
    return {"message": "Defense Connect API"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
