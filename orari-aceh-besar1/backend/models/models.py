from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='UMUM')  # ADMIN, ANGGOTA, UMUM
    callsign = db.Column(db.String(100), unique=True, nullable=True)
    nama = db.Column(db.String(255), nullable=False)
    noAnggota = db.Column(db.String(100), unique=True, nullable=True)
    status = db.Column(db.String(50), default='PENDING')  # PENDING, AKTIF, EXPIRED
    expiredAt = db.Column(db.DateTime, nullable=True)
    alamat = db.Column(db.Text, nullable=True)
    noHp = db.Column(db.String(50), nullable=True)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transaksi = db.relationship('Transaksi', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'callsign': self.callsign,
            'nama': self.nama,
            'noAnggota': self.noAnggota,
            'status': self.status,
            'expiredAt': self.expiredAt.isoformat() if self.expiredAt else None,
            'alamat': self.alamat,
            'noHp': self.noHp,
            'createdAt': self.createdAt.isoformat()
        }

class Transaksi(db.Model):
    __tablename__ = 'Transaksi'
    id = db.Column(db.String(36), primary_key=True)
    userId = db.Column(db.String(36), db.ForeignKey('User.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # DAFTAR_BARU, IURAN, DONASI, MERCHANDISE
    jumlah = db.Column(db.Float, nullable=False)
    buktiTransfer = db.Column(db.String(255), nullable=True)
    keterangan = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default='PENDING')  # PENDING, SUKSES, GAGAL
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.userId,
            'type': self.type,
            'jumlah': self.jumlah,
            'buktiTransfer': self.buktiTransfer,
            'keterangan': self.keterangan,
            'status': self.status,
            'createdAt': self.createdAt.isoformat(),
            'user_nama': self.user.nama if self.user else None,
            'user_callsign': self.user.callsign if self.user else None
        }

class Pengumuman(db.Model):
    __tablename__ = 'Pengumuman'
    id = db.Column(db.String(36), primary_key=True)
    judul = db.Column(db.String(255), nullable=False)
    konten = db.Column(db.Text, nullable=False)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'judul': self.judul,
            'konten': self.konten,
            'createdAt': self.createdAt.isoformat()
        }

class Kegiatan(db.Model):
    __tablename__ = 'Kegiatan'
    id = db.Column(db.String(36), primary_key=True)
    nama = db.Column(db.String(255), nullable=False)
    tanggal = db.Column(db.DateTime, nullable=False)
    lokasi = db.Column(db.String(255), nullable=False)
    deskripsi = db.Column(db.Text, nullable=True)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nama': self.nama,
            'tanggal': self.tanggal.isoformat(),
            'lokasi': self.lokasi,
            'deskripsi': self.deskripsi,
            'createdAt': self.createdAt.isoformat()
        }
