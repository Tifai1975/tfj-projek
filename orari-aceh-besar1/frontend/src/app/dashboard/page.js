'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [txType, setTxType] = useState('IURAN');
  const [jumlah, setJumlah] = useState('');
  const [bukti, setBukti] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Profile Edit fields
  const [nama, setNama] = useState('');
  const [callsign, setCallsign] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');

  // Admin section state
  const [allUsers, setAllUsers] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [editMemberId, setEditMemberId] = useState('');
  const [editMemberData, setEditMemberData] = useState({ nama: '', callsign: '', noAnggota: '', status: '', role: '' });
  
  // Create announcement state
  const [annJudul, setAnnJudul] = useState('');
  const [annKonten, setAnnKonten] = useState('');
  
  // Create activity state
  const [actNama, setActNama] = useState('');
  const [actTanggal, setActTanggal] = useState('');
  const [actLokasi, setActLokasi] = useState('');
  const [actDeskripsi, setActDeskripsi] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!storedToken || !storedUser) {
      router.push('/login');
      return;
    }
    setToken(storedToken);
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setNama(parsedUser.nama || '');
    setCallsign(parsedUser.callsign || '');
    setAlamat(parsedUser.alamat || '');
    setNoHp(parsedUser.noHp || '');
    
    fetchData(storedToken, parsedUser.role);
  }, []);

  const fetchData = async (authToken, role) => {
    setLoading(true);
    try {
      // Fetch user transactions
      const txRes = await fetch('http://localhost:5000/api/transactions', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const txData = await txRes.json();
      setTransactions(txData);

      if (role === 'ADMIN') {
        // Fetch all transactions
        const allTxRes = await fetch('http://localhost:5000/api/transactions', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const allTxData = await allTxRes.json();
        setAllTransactions(allTxData);

        // Fetch all members
        const membersRes = await fetch('http://localhost:5000/api/members');
        const membersData = await membersRes.json();
        setAllUsers(membersData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nama, callsign, alamat, noHp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setSuccess('Profil berhasil diperbarui!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewTransaction = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: txType,
          jumlah: parseFloat(jumlah),
          buktiTransfer: bukti,
          keterangan
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transaction failed');
      setSuccess('Transaksi berhasil diajukan, menunggu konfirmasi admin.');
      setJumlah('');
      setBukti('');
      setKeterangan('');
      fetchData(token, user.role);
    } catch (err) {
      setError(err.message);
    }
  };

  // ADMIN actions
  const handleApproveTx = async (txId, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/transactions/${txId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchData(token, user.role);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/admin/members/${editMemberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editMemberData)
      });
      if (res.ok) {
        setEditMemberId('');
        fetchData(token, user.role);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ judul: annJudul, konten: annKonten })
      });
      if (res.ok) {
        setAnnJudul('');
        setAnnKonten('');
        setSuccess('Pengumuman berhasil dipublikasi!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nama: actNama, tanggal: actTanggal, lokasi: actLokasi, deskripsi: actDeskripsi })
      });
      if (res.ok) {
        setActNama('');
        setActTanggal('');
        setActLokasi('');
        setActDeskripsi('');
        setSuccess('Kegiatan berhasil ditambahkan!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p className="p-6">Loading session...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-800 text-white py-4 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Dashboard Anggota</h1>
          <p className="text-xs text-blue-200">Hi, {user.nama} ({user.role})</p>
        </div>
        <div className="space-x-4">
          <Link href="/" className="hover:underline text-sm">Portal Utama</Link>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto p-6 space-y-8">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded text-sm">{success}</div>}

        {/* Status card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Status Keanggotaan</h2>
            <p className="text-sm text-gray-500">Callsign: {user.callsign || '-'}</p>
            <p className="text-sm text-gray-500">No. Anggota: {user.noAnggota || '-'}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'AKTIF' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {user.status}
            </span>
            <p className="text-xs text-gray-400 mt-2">
              Berlaku hingga: {user.expiredAt ? new Date(user.expiredAt).toLocaleDateString('id-ID') : '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Perbarui Profil</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Nama</label>
                <input type="text" className="mt-1 block w-full p-2 border rounded" value={nama} onChange={(e)=>setNama(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Callsign</label>
                <input type="text" className="mt-1 block w-full p-2 border rounded" value={callsign} onChange={(e)=>setCallsign(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">No. HP</label>
                <input type="text" className="mt-1 block w-full p-2 border rounded" value={noHp} onChange={(e)=>setNoHp(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Alamat</label>
                <textarea className="mt-1 block w-full p-2 border rounded" value={alamat} onChange={(e)=>setAlamat(e.target.value)} rows={2} />
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
                Simpan Perubahan
              </button>
            </form>
          </div>

          {/* New Transaction form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Ajukan Transaksi / Bayar Iuran</h3>
            <form onSubmit={handleNewTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Tipe Transaksi</label>
                <select className="mt-1 block w-full p-2 border rounded" value={txType} onChange={(e)=>setTxType(e.target.value)}>
                  <option value="IURAN">Iuran Keanggotaan (Rp 100.000)</option>
                  <option value="DONASI">Donasi Sukarela</option>
                  <option value="MERCHANDISE">Beli Merchandise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Jumlah (Rupiah)</label>
                <input type="number" className="mt-1 block w-full p-2 border rounded" placeholder="Jumlah transfer" value={jumlah} onChange={(e)=>setJumlah(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Bukti Transfer (Upload URL / Keterangan File)</label>
                <input type="text" className="mt-1 block w-full p-2 border rounded" placeholder="Link gambar atau nama pengirim" value={bukti} onChange={(e)=>setBukti(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Keterangan Tambahan</label>
                <input type="text" className="mt-1 block w-full p-2 border rounded" placeholder="Catatan transaksi" value={keterangan} onChange={(e)=>setKeterangan(e.target.value)} />
              </div>
              <div className="p-3 bg-yellow-50 text-xs text-yellow-800 rounded border border-yellow-200">
                <strong>Rekening Pembayaran:</strong> Bank Aceh Syariah <strong>123-456-7890</strong> a.n. ORARI Lokal Aceh Besar.
              </div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition">
                Kirim Bukti Pembayaran
              </button>
            </form>
          </div>
        </div>

        {/* Transactions History */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Riwayat Transaksi Anda</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 font-semibold text-gray-600">Tanggal</th>
                  <th className="p-3 font-semibold text-gray-600">Tipe</th>
                  <th className="p-3 font-semibold text-gray-600">Jumlah</th>
                  <th className="p-3 font-semibold text-gray-600">Keterangan</th>
                  <th className="p-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="p-3 text-gray-600">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="p-3 font-semibold text-gray-700">{tx.type}</td>
                    <td className="p-3 text-gray-700">Rp {tx.jumlah.toLocaleString()}</td>
                    <td className="p-3 text-gray-500">{tx.keterangan || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${tx.status === 'SUKSES' ? 'bg-green-100 text-green-800' : tx.status === 'GAGAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-gray-400">Belum ada transaksi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADMIN SECTION */}
        {user.role === 'ADMIN' && (
          <div className="space-y-8 pt-8 border-t-2">
            <h2 className="text-2xl font-bold text-red-800">Panel Administrasi (Khusus Admin)</h2>

            {/* List members */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Daftar Anggota / Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 font-semibold text-gray-600">Nama</th>
                      <th className="p-3 font-semibold text-gray-600">Callsign</th>
                      <th className="p-3 font-semibold text-gray-600">No. Anggota</th>
                      <th className="p-3 font-semibold text-gray-600">Role</th>
                      <th className="p-3 font-semibold text-gray-600">Status</th>
                      <th className="p-3 font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3 font-semibold text-gray-700">{u.nama}</td>
                        <td className="p-3 text-gray-700">{u.callsign || '-'}</td>
                        <td className="p-3 text-gray-700">{u.noAnggota || '-'}</td>
                        <td className="p-3 text-gray-600">{u.role}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.status === 'AKTIF' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => {
                              setEditMemberId(u.id);
                              setEditMemberData({ nama: u.nama, callsign: u.callsign || '', noAnggota: u.noAnggota || '', status: u.status, role: u.role });
                            }} 
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Member Modal / Panel */}
            {editMemberId && (
              <div className="bg-gray-100 p-6 rounded-lg border">
                <h3 className="text-lg font-bold mb-4">Edit Detail Anggota</h3>
                <form onSubmit={handleEditMemberSubmit} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Nama</label>
                    <input type="text" className="w-full p-2 border rounded bg-white" value={editMemberData.nama} onChange={(e)=>setEditMemberData({...editMemberData, nama: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Callsign</label>
                    <input type="text" className="w-full p-2 border rounded bg-white" value={editMemberData.callsign} onChange={(e)=>setEditMemberData({...editMemberData, callsign: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">No. Anggota</label>
                    <input type="text" className="w-full p-2 border rounded bg-white" value={editMemberData.noAnggota} onChange={(e)=>setEditMemberData({...editMemberData, noAnggota: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Role</label>
                    <select className="w-full p-2 border rounded bg-white" value={editMemberData.role} onChange={(e)=>setEditMemberData({...editMemberData, role: e.target.value})}>
                      <option value="UMUM">UMUM</option>
                      <option value="ANGGOTA">ANGGOTA</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Status Keanggotaan</label>
                    <select className="w-full p-2 border rounded bg-white" value={editMemberData.status} onChange={(e)=>setEditMemberData({...editMemberData, status: e.target.value})}>
                      <option value="PENDING">PENDING</option>
                      <option value="AKTIF">AKTIF</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-x-2">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs">Simpan</button>
                    <button type="button" onClick={()=>setEditMemberId('')} className="bg-gray-400 text-white px-4 py-2 rounded text-xs">Batal</button>
                  </div>
                </form>
              </div>
            )}

            {/* List transactions for verification */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Verifikasi Bukti Transfer Anggota</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 font-semibold text-gray-600">Anggota</th>
                      <th className="p-3 font-semibold text-gray-600">Tipe</th>
                      <th className="p-3 font-semibold text-gray-600">Jumlah</th>
                      <th className="p-3 font-semibold text-gray-600">Bukti / Keterangan</th>
                      <th className="p-3 font-semibold text-gray-600">Status</th>
                      <th className="p-3 font-semibold text-gray-600">Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="p-3">
                          <p className="font-semibold">{tx.user_nama}</p>
                          <p className="text-xs text-gray-500">{tx.user_callsign || 'No Callsign'}</p>
                        </td>
                        <td className="p-3 font-semibold text-gray-700">{tx.type}</td>
                        <td className="p-3 text-gray-700">Rp {tx.jumlah.toLocaleString()}</td>
                        <td className="p-3">
                          <p className="text-xs text-gray-600">Bukti: <span className="underline">{tx.buktiTransfer}</span></p>
                          <p className="text-xs text-gray-400">{tx.keterangan || '-'}</p>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${tx.status === 'SUKSES' ? 'bg-green-100 text-green-800' : tx.status === 'GAGAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 space-x-2">
                          {tx.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleApproveTx(tx.id, 'APPROVE')} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">Approve</button>
                              <button onClick={() => handleApproveTx(tx.id, 'REJECT')} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Announcement & Kegiatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Buat Pengumuman Baru</h3>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Judul</label>
                    <input type="text" className="w-full p-2 border rounded" value={annJudul} onChange={(e)=>setAnnJudul(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Konten Pengumuman</label>
                    <textarea className="w-full p-2 border rounded" value={annKonten} onChange={(e)=>setAnnKonten(e.target.value)} rows={3} required />
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-xs">Publikasi Pengumuman</button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Tambah Agenda Kegiatan</h3>
                <form onSubmit={handleCreateActivity} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Nama Kegiatan</label>
                    <input type="text" className="w-full p-2 border rounded" value={actNama} onChange={(e)=>setActNama(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Tanggal</label>
                      <input type="date" className="w-full p-2 border rounded" value={actTanggal} onChange={(e)=>setActTanggal(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Lokasi</label>
                      <input type="text" className="w-full p-2 border rounded" value={actLokasi} onChange={(e)=>setActLokasi(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Deskripsi</label>
                    <textarea className="w-full p-2 border rounded" value={actDeskripsi} onChange={(e)=>setActDeskripsi(e.target.value)} rows={2} />
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-xs">Simpan Kegiatan</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
