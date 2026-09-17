import pytest
import json
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import async_session, engine, Base
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import create_access_token
import asyncio

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def db_session():
    async def _get_db():
        async with async_session() as session:
            yield session
            await session.commit()
    return _get_db

@pytest.fixture
async def auth_headers():
    from app.models.user import User
    from app.core.database import async_session
    
    async with async_session() as session:
        user = User(
            email="test@orari.com",
            password="password123",
            nama="Test User",
            callsign="YB6TEST",
            role="ADMIN"
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        token = create_access_token({"sub": user.id, "role": user.role})
        return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def sample_image():
    from io import BytesIO
    return BytesIO(b"fake image content")

def test_auth_register(client):
    response = client.post("/api/auth/register", json={
        "email": "test@orari.com",
        "password": "password123",
        "nama": "Test User",
        "callsign": "YB6TEST"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@orari.com"
    assert data["nama"] == "Test User"

def test_auth_login(client):
    response = client.post("/api/auth/login", data={
        "username": "test@orari.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data

def test_auth_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@orari.com"

def test_berita_create(client, auth_headers, sample_image):
    data = {
        "judul": "Test Berita",
        "konten": "Test konten berita",
    }
    files = {"image": ("test.jpg", sample_image, "image/jpeg")}
    response = client.post("/api/berita", data=data, files=files, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["judul"] == "Test Berita"
    assert "id" in data

def test_berita_get_all(client):
    response = client.get("/api/berita")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_berita_get_by_id(client):
    response = client.get("/api/berita/1")
    assert response.status_code == 404

def test_galeri_create(client, auth_headers, sample_image):
    data = {
        "judul": "Test Galeri",
        "deskripsi": "Test deskripsi galeri",
    }
    files = {"image": ("test.jpg", sample_image, "image/jpeg")}
    response = client.post("/api/galeri", data=data, files=files, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["judul"] == "Test Galeri"
    assert "id" in data
    assert "image_url" in data

def test_galeri_get_all(client):
    response = client.get("/api/galeri")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_galeri_get_by_id(client):
    response = client.get("/api/galeri/1")
    assert response.status_code == 404

def test_transaksi_create(client, auth_headers):
    response = client.post("/api/transaksi", json={
        "type": "IURAN",
        "jumlah": 100000.0,
        "buktiTransfer": "bukti.jpg",
        "keterangan": "Iuran 2026"
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "IURAN"
    assert data["status"] == "PENDING"

def test_transaksi_get_all(client, auth_headers):
    response = client.get("/api/transaksi", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_pengumuman_get_all(client):
    response = client.get("/api/pengumuman")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_kegiatan_get_all(client):
    response = client.get("/api/kegiatan")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_admin_stats(client, auth_headers):
    response = client.get("/api/admin/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data