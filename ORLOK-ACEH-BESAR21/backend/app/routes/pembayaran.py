import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_access_token
from app.models.user import User
from app.models.transaksi import Transaksi

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/transactions", status_code=201)
async def create_transaction(data: dict, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = verify_access_token(token)
    if not payload or payload.get("role") not in ("ADMIN", "UMUM"):
        raise HTTPException(status_code=403, detail="Forbidden")
    user_id = payload.get("sub")
    tx = Transaksi(
        id=str(uuid.uuid4()), userId=user_id, type=data.get("type"),
        jumlah=float(data.get("jumlah", 0)), buktiTransfer=data.get("buktiTransfer"),
        keterangan=data.get("keterangan"), status="PENDING"
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    result = await db.execute(select(Transaksi).options(selectinload(Transaksi.user)).where(Transaksi.id == tx.id))
    tx_loaded = result.scalar_one()
    return tx_loaded.to_dict()

@router.get("/transactions", response_model=list)
async def get_transactions(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthenticated")
    if payload.get("role") == "ADMIN":
        result = await db.execute(select(Transaksi).options(selectinload(Transaksi.user)).order_by(Transaksi.createdAt.desc()))
    else:
        result = await db.execute(select(Transaksi).options(selectinload(Transaksi.user)).where(Transaksi.userId == payload.get("sub")).order_by(Transaksi.createdAt.desc()))
    items = result.scalars().all()
    return [i.to_dict() for i in items]

@router.post("/admin/transactions/{tx_id}/approve")
async def approve_transaction(tx_id: str, token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.execute(select(Transaksi).options(selectinload(Transaksi.user)).where(Transaksi.id == tx_id))
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    tx.status = "SUKSES"
    user = tx.user
    if user:
        user.status = "AKTIF"
        user.role = "ANGGOTA"
        if not user.expiredAt or user.expiredAt < datetime.utcnow():
            user.expiredAt = datetime.utcnow() + timedelta(days=365)
    await db.commit()
    return tx.to_dict()