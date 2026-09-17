import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Transaksi(Base):
    __tablename__ = "Transaksi"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String(36), ForeignKey("User.id"), nullable=False)
    type = Column(String(50), nullable=False)
    jumlah = Column(Float, nullable=False)
    buktiTransfer = Column(String(255), nullable=True)
    keterangan = Column(String(255), nullable=True)
    status = Column(String(50), default="PENDING")
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="transaksi")

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "type": self.type,
            "jumlah": self.jumlah,
            "buktiTransfer": self.buktiTransfer,
            "keterangan": self.keterangan,
            "status": self.status,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
            "user_nama": self.user.nama if self.user else None,
            "user_callsign": self.user.callsign if self.user else None,
        }