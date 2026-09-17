import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_CATEGORIES = {"berita", "galeri"}
ALLOWED_IMAGES = {
    ".jpg": (b"\xff\xd8\xff", "image/jpeg"),
    ".jpeg": (b"\xff\xd8\xff", "image/jpeg"),
    ".png": (b"\x89PNG\r\n\x1a\n", "image/png"),
    ".webp": (b"RIFF", "image/webp"),
    ".gif": (b"GIF87a", "image/gif"),
    ".gifv": (b"GIF87a", "image/gif"),
}


def _image_signature(content: bytes) -> bool:
    for extension, (signature, _) in ALLOWED_IMAGES.items():
        if extension == ".webp":
            if content[:4] == signature and content[8:12] == b"WEBP":
                return True
        elif content.startswith(signature):
            return True
    return False


async def save_image(file: UploadFile, category: str) -> str:
    if category not in ALLOWED_CATEGORIES or not file.filename:
        raise HTTPException(status_code=400, detail="Invalid upload category")

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_IMAGES:
        raise HTTPException(status_code=415, detail="Only JPG, PNG, WEBP, and GIF images are allowed")

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    if not content or not _image_signature(content):
        raise HTTPException(status_code=415, detail="File content does not match its image extension")

    upload_dir = Path(settings.UPLOAD_DIR) / category
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{extension}"
    filepath = upload_dir / filename
    filepath.write_bytes(content)
    os.chmod(filepath, 0o640)
    return f"/uploads/{category}/{filename}"


def remove_image(image_url: str | None) -> None:
    if not image_url:
        return
    if not image_url.startswith("/uploads/") or image_url.count("/") != 3:
        return

    _, _, category, filename = image_url.split("/")
    if category not in ALLOWED_CATEGORIES or Path(filename).name != filename:
        return

    filepath = Path(settings.UPLOAD_DIR) / category / filename
    try:
        filepath.unlink()
    except FileNotFoundError:
        pass
