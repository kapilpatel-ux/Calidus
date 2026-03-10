import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestStats:
    def test_get_stats(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/stats")
        assert r.status_code == 200
        data = r.json()
        assert "categories" in data
        assert "components" in data
        assert "suppliers" in data
        assert data["categories"] > 0
        assert data["components"] > 0
        assert data["suppliers"] > 0


class TestCategories:
    def test_get_all_categories(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/categories")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 6

    def test_category_fields(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/categories")
        assert r.status_code == 200
        cat = r.json()[0]
        assert "id" in cat
        assert "name" in cat
        assert "slug" in cat
        assert "description" in cat

    def test_get_category_by_slug(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/categories/electronics")
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == "electronics"
        assert data["name"] == "Electronics"

    def test_get_category_not_found(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/categories/nonexistent-slug")
        assert r.status_code == 404


class TestProducts:
    def test_get_all_products(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_product_fields(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        product = r.json()[0]
        assert "id" in product
        assert "name" in product
        assert "slug" in product
        assert "supplier_id" in product
        assert "category_id" in product

    def test_get_featured_products(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products?featured=true")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        for p in data:
            assert p["featured"] is True

    def test_get_product_by_slug(self, api_client):
        # Get first product slug dynamically
        r = api_client.get(f"{BASE_URL}/api/products")
        slug = r.json()[0]["slug"]
        r2 = api_client.get(f"{BASE_URL}/api/products/{slug}")
        assert r2.status_code == 200
        assert r2.json()["slug"] == slug

    def test_get_product_not_found(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products/nonexistent-slug")
        assert r.status_code == 404

    def test_filter_products_by_category(self, api_client):
        # Get category ID first
        cats = api_client.get(f"{BASE_URL}/api/categories").json()
        cat_id = cats[0]["id"]
        r = api_client.get(f"{BASE_URL}/api/products?category={cat_id}")
        assert r.status_code == 200
        data = r.json()
        for p in data:
            assert p["category_id"] == cat_id


class TestSuppliers:
    def test_get_all_suppliers(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/suppliers")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 3

    def test_supplier_fields(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/suppliers")
        assert r.status_code == 200
        sup = r.json()[0]
        assert "id" in sup
        assert "name" in sup
        assert "slug" in sup
        assert "rating" in sup
        assert "verified" in sup

    def test_get_supplier_by_slug(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/suppliers/sentinel-defense-systems")
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == "sentinel-defense-systems"

    def test_filter_verified_suppliers(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/suppliers?verified=true")
        assert r.status_code == 200
        data = r.json()
        for s in data:
            assert s["verified"] is True

    def test_get_supplier_not_found(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/suppliers/nonexistent-supplier")
        assert r.status_code == 404


class TestSearch:
    def test_search_suggestions(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/search/suggestions?q=armor")
        assert r.status_code == 200
        data = r.json()
        assert "suggestions" in data
        assert isinstance(data["suggestions"], list)
        assert len(data["suggestions"]) > 0

    def test_suggestion_fields(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/search/suggestions?q=armor")
        suggestions = r.json()["suggestions"]
        s = suggestions[0]
        assert "type" in s
        assert "id" in s
        assert "name" in s
        assert "score" in s

    def test_search_suggestions_min_length(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/search/suggestions?q=a")
        assert r.status_code == 200
        assert r.json()["suggestions"] == []

    def test_search_post(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/search", json={"query": "armor"})
        assert r.status_code == 200
        data = r.json()
        assert "products" in data
        assert "suppliers" in data
        assert "categories" in data


class TestContact:
    def test_submit_contact(self, api_client):
        payload = {
            "full_name": "TEST_John Doe",
            "company_name": "TEST_Defense Corp",
            "email": f"test_{uuid.uuid4().hex[:8]}@testcompany.com",
            "phone": "+1234567890",
            "subject": "General Inquiry",
            "message": "This is a test message for regression testing."
        }
        r = api_client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "id" in data
        assert data["full_name"] == payload["full_name"]
        assert data["email"] == payload["email"]

    def test_contact_missing_required_fields(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/contact", json={"full_name": "Test"})
        assert r.status_code == 422


class TestSupplierRegistration:
    def test_register_supplier(self, api_client):
        unique_email = f"supplier_{uuid.uuid4().hex[:8]}@testdefense.com"
        payload = {
            "company_name": "TEST_Defense Supplier Co",
            "supplier_type": "Manufacturer",
            "contact_person": "TEST_Jane Smith",
            "email": unique_email,
            "phone": "+9876543210",
            "license_number": f"LIC-{uuid.uuid4().hex[:8]}",
            "vat_number": "VAT123456"
        }
        r = api_client.post(f"{BASE_URL}/api/supplier-registration", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "id" in data
        assert data["company_name"] == payload["company_name"]
        assert data["status"] == "pending"

    def test_register_supplier_duplicate_email(self, api_client):
        unique_email = f"dup_{uuid.uuid4().hex[:8]}@testdefense.com"
        payload = {
            "company_name": "TEST_Supplier",
            "supplier_type": "Distributor",
            "contact_person": "TEST_Person",
            "email": unique_email,
            "phone": "+1234567890",
            "license_number": f"LIC-{uuid.uuid4().hex[:8]}"
        }
        r1 = api_client.post(f"{BASE_URL}/api/supplier-registration", json=payload)
        assert r1.status_code == 200
        r2 = api_client.post(f"{BASE_URL}/api/supplier-registration", json=payload)
        assert r2.status_code == 400


class TestAuth:
    def test_register_user(self, api_client):
        unique_email = f"user_{uuid.uuid4().hex[:8]}@testdefense.com"
        payload = {
            "email": unique_email,
            "full_name": "TEST_Test User",
            "password": "SecurePass123!",
            "user_type": "buyer"
        }
        r = api_client.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email

    def test_register_duplicate_email(self, api_client):
        unique_email = f"dup2_{uuid.uuid4().hex[:8]}@testdefense.com"
        payload = {
            "email": unique_email,
            "full_name": "TEST_Test User",
            "password": "SecurePass123!",
            "user_type": "buyer"
        }
        api_client.post(f"{BASE_URL}/api/auth/register", json=payload)
        r = api_client.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert r.status_code == 400

    def test_login_valid_credentials(self, api_client):
        unique_email = f"login_{uuid.uuid4().hex[:8]}@testdefense.com"
        payload = {
            "email": unique_email,
            "full_name": "TEST_Login User",
            "password": "LoginPass456!",
            "user_type": "buyer"
        }
        api_client.post(f"{BASE_URL}/api/auth/register", json=payload)
        r = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "LoginPass456!"
        })
        assert r.status_code == 200
        data = r.json()
        assert "token" in data
        assert "user" in data

    def test_login_invalid_credentials(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        assert r.status_code == 401


class TestInquiry:
    def test_submit_inquiry(self, api_client):
        suppliers = api_client.get(f"{BASE_URL}/api/suppliers").json()
        supplier_id = suppliers[0]["id"]
        payload = {
            "supplier_id": supplier_id,
            "message": "TEST_Inquiry about your products",
            "full_name": "TEST_Buyer",
            "email": f"inquiry_{uuid.uuid4().hex[:8]}@testbuyer.com",
            "company_name": "TEST_Buyer Corp"
        }
        r = api_client.post(f"{BASE_URL}/api/inquiry", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "id" in data
        assert "message" in data



class TestFilterOptions:
    def test_get_filter_options(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/filter-options")
        assert r.status_code == 200
        data = r.json()
        assert "countries" in data
        assert "certifications" in data
        assert isinstance(data["countries"], list)
        assert isinstance(data["certifications"], list)
        assert len(data["countries"]) > 0
        assert len(data["certifications"]) > 0

    def test_filter_options_countries_values(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/filter-options")
        data = r.json()
        # Countries should be strings
        for country in data["countries"]:
            assert isinstance(country, str)

    def test_filter_options_certifications_values(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/filter-options")
        data = r.json()
        # Certifications should be strings
        for cert in data["certifications"]:
            assert isinstance(cert, str)


class TestRelatedProducts:
    def test_get_related_products(self, api_client):
        # Get first product slug
        r = api_client.get(f"{BASE_URL}/api/products")
        slug = r.json()[0]["slug"]
        r2 = api_client.get(f"{BASE_URL}/api/products/{slug}/related")
        assert r2.status_code == 200
        data = r2.json()
        assert isinstance(data, list)

    def test_related_products_fields(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products")
        slug = r.json()[0]["slug"]
        r2 = api_client.get(f"{BASE_URL}/api/products/{slug}/related")
        data = r2.json()
        if len(data) > 0:
            product = data[0]
            assert "id" in product
            assert "name" in product
            assert "slug" in product

    def test_related_products_not_include_self(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products")
        products = r.json()
        slug = products[0]["slug"]
        product_id = products[0]["id"]
        r2 = api_client.get(f"{BASE_URL}/api/products/{slug}/related")
        data = r2.json()
        related_ids = [p["id"] for p in data]
        assert product_id not in related_ids


class TestEnhancedSupplierFields:
    def test_supplier_enhanced_fields(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/suppliers/sentinel-defense-systems")
        assert r.status_code == 200
        data = r.json()
        # Enhanced fields from new seeding
        assert "years_in_operation" in data
        assert "supplier_type" in data
        assert "profile_completeness" in data

    def test_supplier_profile_completeness_range(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/suppliers/sentinel-defense-systems")
        data = r.json()
        completeness = data.get("profile_completeness", 0)
        assert 0 <= completeness <= 100


class TestEnhancedProductFields:
    def test_product_enhanced_fields(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products/rocket-launcher-m270-mlrs")
        assert r.status_code == 200
        data = r.json()
        # Enhanced product fields
        assert "lead_time" in data
        assert "application_areas" in data
        assert "subcategory" in data

    def test_search_suggestions_categorized(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/search/suggestions?q=armor")
        assert r.status_code == 200
        data = r.json()
        suggestions = data["suggestions"]
        assert len(suggestions) > 0
        types = [s["type"] for s in suggestions]
        # Should have categorized types
        valid_types = {"product", "supplier", "category"}
        for t in types:
            assert t in valid_types


class TestProductSubmission:
    def test_submit_product_basic(self, api_client):
        """Test submitting a new product without authentication"""
        categories = api_client.get(f"{BASE_URL}/api/categories").json()
        category = categories[0]
        
        payload = {
            "name": f"TEST_Product_{uuid.uuid4().hex[:8]}",
            "category_id": category["id"],
            "category_name": category["name"],
            "short_description": "TEST Short description for testing",
            "description": "TEST Full description for the product being tested in regression suite"
        }
        r = api_client.post(f"{BASE_URL}/api/product-submission", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        assert data["status"] == "pending"
        assert data["supplier_id"] == "pending-supplier"
        assert data["supplier_name"] == "Pending Verification"

    def test_submit_product_with_full_details(self, api_client):
        """Test submitting a product with all optional fields"""
        categories = api_client.get(f"{BASE_URL}/api/categories").json()
        category = categories[0]
        
        payload = {
            "name": f"TEST_FullProduct_{uuid.uuid4().hex[:8]}",
            "category_id": category["id"],
            "category_name": category["name"],
            "short_description": "TEST Full product short description",
            "description": "TEST Complete product description with all fields",
            "image_url": "https://example.com/product.jpg",
            "price_range": "$10,000 - $50,000",
            "currency": "USD",
            "specifications": {"Range": "100km", "Weight": "50kg"},
            "certifications": ["ISO 9001:2015", "NATO STANAG"],
            "dimensions": "100cm x 50cm x 30cm",
            "weight": "50 kg",
            "operating_temp": "-40°C to +55°C",
            "lead_time": "4-6 weeks",
            "delivery_type": "Made to Order",
            "subcategory": category.get("subcategories", ["General"])[0] if category.get("subcategories") else "General"
        }
        r = api_client.post(f"{BASE_URL}/api/product-submission", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["price_range"] == payload["price_range"]
        assert data["currency"] == "USD"
        assert "Range" in data["specifications"]
        assert "ISO 9001:2015" in data["certifications"]
        assert data["delivery_type"] == "Made to Order"

    def test_submit_product_missing_required_fields(self, api_client):
        """Test that required fields are validated"""
        payload = {
            "name": "Test Product"
            # Missing required fields: category_id, category_name, short_description, description
        }
        r = api_client.post(f"{BASE_URL}/api/product-submission", json=payload)
        assert r.status_code == 422  # Validation error

    def test_get_product_submissions(self, api_client):
        """Test retrieving product submissions"""
        r = api_client.get(f"{BASE_URL}/api/product-submissions")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_get_product_submissions_by_status(self, api_client):
        """Test filtering submissions by status"""
        r = api_client.get(f"{BASE_URL}/api/product-submissions?status=pending")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for submission in data:
            assert submission["status"] == "pending"

    def test_submit_product_response_fields(self, api_client):
        """Verify all expected fields are present in submission response"""
        categories = api_client.get(f"{BASE_URL}/api/categories").json()
        category = categories[0]
        
        payload = {
            "name": f"TEST_FieldsProduct_{uuid.uuid4().hex[:8]}",
            "category_id": category["id"],
            "category_name": category["name"],
            "short_description": "TEST Product for field verification",
            "description": "TEST Description for checking response fields"
        }
        r = api_client.post(f"{BASE_URL}/api/product-submission", json=payload)
        assert r.status_code == 200
        data = r.json()
        
        # Verify all expected fields
        expected_fields = [
            "id", "name", "category_id", "category_name", "short_description",
            "description", "image_url", "price_range", "currency", "specifications",
            "certifications", "dimensions", "weight", "operating_temp", "lead_time",
            "delivery_type", "subcategory", "supplier_id", "supplier_name", "status", "created_at"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
