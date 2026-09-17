import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_access_token
from app.models.berita import Berita
from app.services.upload import save_image, remove_image

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/", status_code=201)
async def create_berita(
    judul: str = Form(...),
    konten: str = Form(...),
    image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")
    image_url = None
    if image and image.size > 0:
        image_url = await save_image(image, "berita")
    berita = Berita(judul=judul, konten=konten, image_url=image_url)
    db.add(berita)
    await db.commit()
    await db.refresh(berita)
    return berita.to_dict()

@router.get("/")
async def get_berita(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Berita).order_by(Berita.createdAt.desc()))
    items = result.scalars().all()
    return [i.to_dict() for i in items]

@router.get("/{berita_id}")
async def get_berita_by_id(berita_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Berita).where(Berita.id == berita_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Berita not found")
    return item.to_dict()

@router.put("/{berita_id}")
async def update_berita(
    berita_id: str,
    judul: str | None = Form(None),
    konten: str | None = Form(None),
    image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.execute(select(Berita).where(Berita.id == berita_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Berita not found")
    if judul is not None:
        item.judul = judul
    if konten is not None:
        item.konten = konten
    if image is not None and image.size > 0:
        old_image = item.image_url
        image_url = await save_image(image, "berita")
        item.image_url = image_url
        await db.commit()
        await db.refresh(item)
        remove_image(old_image)
        return item.to_dict()
    item.updatedAt = datetime.utcnow()
    await db.commit()
    await db.refresh(item)
    return item.to_dict()

@router.delete("/{berita_id}", status_code=204)
async def delete_berita(berita_id: str, db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = verify_access_token(token)
    if not payload or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.execute(select(Berita).where(Berita.id == berita_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Berita not found")
    remove_image(item.image_url)
    await db.delete(item)
    await db.commit()
    return None
