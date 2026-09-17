import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_access_token
from app.models.pengumuman import Pengumuman
from app.core.config import settings as app_settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.get("/")
async def get_pengumuman(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pengumuman).order_by(Pengumuman.createdAt.desc()))
    items = result.scalars().all()
    return [i.to_dict() for i in items]

@router.post("/", status_code=201)
async def create_pengumuman(data: dict, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")
    pengumuman = Pengumuman(id=str(uuid.uuid4()), **data)
    db.add(pengumuman)
    await db.commit()
    await db.refresh(pengumuman)
    return pengumuman.to_dict()