import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "User"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="UMUM")
    callsign = Column(String(100), unique=True, nullable=True)
    nama = Column(String(255), nullable=False)
    noAnggota = Column(String(100), unique=True, nullable=True)
    status = Column(String(50), default="PENDING")
    expiredAt = Column(DateTime, nullable=True)
    alamat = Column(Text, nullable=True)
    noHp = Column(String(50), nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transaksi = relationship("Transaksi", back_populates="user")

    def check_password(self, password: str) -> bool:
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "callsign": self.callsign,
            "nama": self.nama,
            "noAnggota": self.noAnggota,
            "status": self.status,
            "expiredAt": self.expiredAt.isoformat() if self.expiredAt else None,
            "alamat": self.alamat,
            "noHp": self.noHp,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }
