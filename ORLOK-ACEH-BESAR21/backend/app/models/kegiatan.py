import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.core.database import Base


class Kegiatan(Base):
    __tablename__ = "Kegiatan"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nama = Column(String(255), nullable=False)
    tanggal = Column(DateTime, nullable=False)
    lokasi = Column(String(255), nullable=False)
    deskripsi = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nama": self.nama,
            "tanggal": self.tanggal.isoformat() if self.tanggal else None,
            "lokasi": self.lokasi,
            "deskripsi": self.deskripsi,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }