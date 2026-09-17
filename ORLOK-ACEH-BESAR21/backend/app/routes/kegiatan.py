import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_access_token
from app.models.kegiatan import Kegiatan

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.get("/")
async def get_kegiatan(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Kegiatan).order_by(Kegiatan.tanggal.asc()))
    items = result.scalars().all()
    return [i.to_dict() for i in items]

@router.post("/", status_code=201)
async def create_kegiatan(data: dict, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")
    try:
        tang = datetime.fromisoformat(data.get("tanggal"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid tanggal format")
    kegiatan = Kegiatan(
        id=str(uuid.uuid4()), nama=data.get("nama"), tanggal=tang,
        lokasi=data.get("lokasi"), deskripsi=data.get("deskripsi")
    )
    db.add(kegiatan)
    await db.commit()
    await db.refresh(kegiatan)
    return kegiatan.to_dict()
