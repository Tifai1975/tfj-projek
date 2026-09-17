import uuid
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, User, Transaksi, Pengumuman, Kegiatan

routes_bp = Blueprint('routes', __name__)

# Helpers for admin verification
def is_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.role == 'ADMIN'

# 1. Profile / Anggota Update
@routes_bp.route('/members', methods=['GET'])
def get_members():
    # Public & member calls
    status = request.args.get('status')
    query = User.query
    if status:
        query = query.filter_by(status=status)
    members = query.all()
    return jsonify([m.to_dict() for m in members]), 200

@routes_bp.route('/profile/update', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    data = request.get_json() or {}
    user.nama = data.get('nama', user.nama)
    user.callsign = data.get('callsign', user.callsign)
    user.alamat = data.get('alamat', user.alamat)
    user.noHp = data.get('noHp', user.noHp)
    
    db.session.commit()
    return jsonify(user.to_dict()), 200

# Admin update member detail (including noAnggota, role, status, expiredAt)
@routes_bp.route('/admin/members/<string:member_id>', methods=['PUT'])
@jwt_required()
def admin_update_member(member_id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    user = User.query.get(member_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    data = request.get_json() or {}
    user.nama = data.get('nama', user.nama)
    user.callsign = data.get('callsign', user.callsign)
    user.noAnggota = data.get('noAnggota', user.noAnggota)
    user.role = data.get('role', user.role)
    user.status = data.get('status', user.status)
    
    expired_str = data.get('expiredAt')
    if expired_str:
        user.expiredAt = datetime.fromisoformat(expired_str)
        
    db.session.commit()
    return jsonify(user.to_dict()), 200

# 2. Transactions (Iuran, Donasi, Merchandise, Daftar Baru)
@routes_bp.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    tx_type = data.get('type')
    jumlah = data.get('jumlah')
    bukti = data.get('buktiTransfer')
    keterangan = data.get('keterangan')
    
    if not tx_type or not jumlah:
        return jsonify({'error': 'Type and jumlah are required'}), 400
        
    tx = Transaksi(
        id=str(uuid.uuid4()),
        userId=user_id,
        type=tx_type,
        jumlah=float(jumlah),
        buktiTransfer=bukti,
        keterangan=keterangan,
        status='PENDING'
    )
    db.session.add(tx)
    db.session.commit()
    return jsonify(tx.to_dict()), 201

@routes_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
         return jsonify({'error': 'User not found'}), 404
    if user.role == 'ADMIN':
        txs = Transaksi.query.all()
    else:
        txs = Transaksi.query.filter_by(userId=user_id).all()
    return jsonify([t.to_dict() for t in txs]), 200

@routes_bp.route('/admin/transactions/<string:tx_id>/approve', methods=['POST'])
@jwt_required()
def approve_transaction(tx_id):
    if not is_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    tx = Transaksi.query.get(tx_id)
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
        
    data = request.get_json() or {}
    action = data.get('action') # APPROVE or REJECT
    
    if action == 'APPROVE':
        tx.status = 'SUKSES'
        # If transaction type is DAFTAR_BARU or IURAN, automatically activate user / extend expiration
        if tx.type in ['DAFTAR_BARU', 'IURAN']:
            user = User.query.get(tx.userId)
            if user:
                user.status = 'AKTIF'
                user.role = 'ANGGOTA'
                # Set or extend expiration for 1 year
                base_time = user.expiredAt if (user.expiredAt and user.expiredAt > datetime.utcnow()) else datetime.utcnow()
                user.expiredAt = base_time + timedelta(days=365)
    elif action == 'REJECT':
        tx.status = 'GAGAL'
    else:
        return jsonify({'error': 'Invalid action'}), 400
        
    db.session.commit()
    return jsonify(tx.to_dict()), 200

# 3. Info (Pengumuman, Kegiatan)
@routes_bp.route('/announcements', methods=['GET'])
def get_announcements():
    ann = Pengumuman.query.order_by(Pengumuman.createdAt.desc()).all()
    return jsonify([a.to_dict() for a in ann]), 200

@routes_bp.route('/announcements', methods=['POST'])
@jwt_required()
def create_announcement():
    if not is_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json() or {}
    judul = data.get('judul')
    konten = data.get('konten')
    
    if not judul or not konten:
        return jsonify({'error': 'Judul and konten are required'}), 400
        
    ann = Pengumuman(
        id=str(uuid.uuid4()),
        judul=judul,
        konten=konten
    )
    db.session.add(ann)
    db.session.commit()
    return jsonify(ann.to_dict()), 201

@routes_bp.route('/activities', methods=['GET'])
def get_activities():
    act = Kegiatan.query.order_by(Kegiatan.tanggal.asc()).all()
    return jsonify([a.to_dict() for a in act]), 200

@routes_bp.route('/activities', methods=['POST'])
@jwt_required()
def create_activity():
    if not is_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json() or {}
    nama = data.get('nama')
    tanggal_str = data.get('tanggal')
    lokasi = data.get('lokasi')
    deskripsi = data.get('deskripsi')
    
    if not nama or not tanggal_str or not lokasi:
        return jsonify({'error': 'Nama, tanggal, and lokasi are required'}), 400
        
    act = Kegiatan(
        id=str(uuid.uuid4()),
        nama=nama,
        tanggal=datetime.fromisoformat(tanggal_str),
        lokasi=lokasi,
        deskripsi=deskripsi
    )
    db.session.add(act)
    db.session.commit()
    return jsonify(act.to_dict()), 201

# Dashboard Statistics & Near Expired Members
@routes_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    # Active members
    active_count = User.query.filter_by(status='AKTIF').count()
    # Expiring within 30 days
    limit_date = datetime.utcnow() + timedelta(days=30)
    near_expired = User.query.filter(User.status == 'AKTIF', User.expiredAt <= limit_date).all()
    
    # Latest Announcements
    latest_ann = Pengumuman.query.order_by(Pengumuman.createdAt.desc()).limit(3).all()
    # Upcoming Activities
    upcoming_act = Kegiatan.query.filter(Kegiatan.tanggal >= datetime.utcnow()).order_by(Kegiatan.tanggal.asc()).limit(3).all()
    
    return jsonify({
        'active_members_count': active_count,
        'near_expired': [m.to_dict() for m in near_expired],
        'announcements': [a.to_dict() for a in latest_ann],
        'activities': [a.to_dict() for a in upcoming_act]
    }), 200
