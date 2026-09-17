import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.core.database import Base


class Pengumuman(Base):
    __tablename__ = "Pengumuman"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    judul = Column(String(255), nullable=False)
    konten = Column(Text, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "judul": self.judul,
            "konten": self.konten,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }