import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import verify_access_token
from app.models.user import User
from app.models.pengumuman import Pengumuman
from app.models.kegiatan import Kegiatan

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

@router.get("/stats", status_code=200)
async def get_dashboard_stats(token: str | None = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = verify_access_token(token) if token else None
    active_count_result = await db.execute(select(func.count()).select_from(User).where(User.status == "AKTIF"))
    active_count = active_count_result.scalar_one()
    limit_date = datetime.utcnow() + timedelta(days=30)
    near_expired_result = await db.execute(select(User).where(User.status == "AKTIF", User.expiredAt <= limit_date))
    near_expired = [u.to_dict() for u in near_expired_result.scalars().all()]
    latest_ann_result = await db.execute(select(Pengumuman).order_by(Pengumuman.createdAt.desc()).limit(3))
    latest_ann = [a.to_dict() for a in latest_ann_result.scalars().all()]
    upcoming_act_result = await db.execute(select(Kegiatan).where(Kegiatan.tanggal >= datetime.utcnow()).order_by(Kegiatan.tanggal.asc()).limit(3))
    upcoming_act = [a.to_dict() for a in upcoming_act_result.scalars().all()]
    return {
        "active_members_count": active_count,
        "near_expired": near_expired,
        "announcements": latest_ann,
        "activities": upcoming_act,
    }
