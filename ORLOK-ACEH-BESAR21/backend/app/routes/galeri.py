import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import verify_access_token
from app.models.galeri import Galeri
from app.services.upload import save_image, remove_image

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.get("/")
async def get_galeri(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Galeri).order_by(Galeri.createdAt.desc()))
    items = result.scalars().all()
    return [i.to_dict() for i in items]


@router.get("/{galeri_id}")
async def get_galeri_by_id(galeri_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Galeri).where(Galeri.id == galeri_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Galeri not found")
    return item.to_dict()


@router.post("/", status_code=201)
async def create_galeri(
    judul: str | None = Form(None),
    deskripsi: str | None = Form(None),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")

    image_url = await save_image(image, "galeri")
    galeri = Galeri(id=str(uuid.uuid4()), judul=judul, deskripsi=deskripsi, image_url=image_url)
    db.add(galeri)
    await db.commit()
    await db.refresh(galeri)
    return galeri.to_dict()


@router.put("/{galeri_id}")
async def update_galeri(
    galeri_id: str,
    judul: str | None = Form(None),
    deskripsi: str | None = Form(None),
    image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")

    result = await db.execute(select(Galeri).where(Galeri.id == galeri_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Galeri not found")

    if judul is not None:
        item.judul = judul
    if deskripsi is not None:
        item.deskripsi = deskripsi
    if image is not None:
        old_image = item.image_url
        image_url = await save_image(image, "galeri")
        item.image_url = image_url
        await db.commit()
        await db.refresh(item)
        remove_image(old_image)
        return item.to_dict()

    item.updatedAt = datetime.utcnow()
    await db.commit()
    await db.refresh(item)
    return item.to_dict()


@router.delete("/{galeri_id}", status_code=204)
async def delete_galeri(
    galeri_id: str,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")

    result = await db.execute(select(Galeri).where(Galeri.id == galeri_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Galeri not found")

    remove_image(item.image_url)
    await db.delete(item)
    await db.commit()
    return None