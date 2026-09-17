from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.routes import auth, berita, galeri, kegiatan, pengumuman, pembayaran, admin, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="ORLOK Aceh Besar API",
    description="Portal Informasi dan Manajemen Anggota ORARI Lokal Aceh Besar",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(berita.router, prefix="/api/berita", tags=["Berita"])
app.include_router(galeri.router, prefix="/api/galeri", tags=["Galeri"])
app.include_router(pengumuman.router, prefix="/api/pengumuman", tags=["Pengumuman"])
app.include_router(kegiatan.router, prefix="/api/kegiatan", tags=["Kegiatan"])
app.include_router(pembayaran.router, prefix="/api", tags=["Transaksi"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
