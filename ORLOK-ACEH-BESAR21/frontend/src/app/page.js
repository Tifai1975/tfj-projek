'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [stats, setStats] = useState({
    active_members_count: 0,
    near_expired: [],
    announcements: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-800 text-white py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">ORARI LOKAL ACEH BESAR</h1>
            <p className="text-xs text-blue-200">Organisasi Amatir Radio Indonesia</p>
          </div>
          <nav className="space-x-4">
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition">
              Login Anggota
            </Link>
            <Link href="/register" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold px-4 py-2 rounded text-sm transition">
              Daftar Baru
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left/Middle Column (News & Schedule) */}
        <div className="md:col-span-2 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-2">Selamat Datang di Portal ORARI Aceh Besar</h2>
            <p className="text-indigo-100">Portal pelayanan administrasi, iuran, donasi, update data callsign, dan informasi kegiatan amatir radio di wilayah Kabupaten Aceh Besar.</p>
          </div>

          {/* Pengumuman */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Pengumuman Terbaru</h3>
            {loading ? (
              <p className="text-gray-500 text-sm">Memuat data...</p>
            ) : stats.announcements.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada pengumuman saat ini.</p>
            ) : (
              <div className="space-y-4">
                {stats.announcements.map((ann) => (
                  <div key={ann.id} className="border-l-4 border-blue-600 pl-4 py-1">
                    <h4 className="font-semibold text-gray-800">{ann.judul}</h4>
                    <p className="text-gray-600 text-sm mt-1">{ann.konten}</p>
                    <span className="text-xs text-gray-400 mt-2 block">{new Date(ann.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Kegiatan */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Agenda Kegiatan</h3>
            {loading ? (
              <p className="text-gray-500 text-sm">Memuat data...</p>
            ) : stats.activities.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada agenda kegiatan mendatang.</p>
            ) : (
              <div className="space-y-4">
                {stats.activities.map((act) => (
                  <div key={act.id} className="bg-gray-50 p-4 rounded border">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-800">{act.nama}</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                        {new Date(act.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{act.deskripsi}</p>
                    <div className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
                      <span>📍 {act.lokasi}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Statistics & Expiry Info) */}
        <div className="space-y-6">
          {/* Stat Card */}
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Anggota Aktif</h3>
            {loading ? (
              <p className="text-3xl font-extrabold text-blue-800 mt-2">...</p>
            ) : (
              <p className="text-4xl font-extrabold text-blue-800 mt-2">{stats.active_members_count}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Lokal Aceh Besar</p>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-bold text-red-600 border-b pb-2 mb-3 uppercase tracking-wider">Hampir Kadaluarsa (&lt;30 Hari)</h3>
            {loading ? (
              <p className="text-gray-500 text-xs">Memuat data...</p>
            ) : stats.near_expired.length === 0 ? (
              <p className="text-gray-500 text-xs">Semua keanggotaan aktif aman.</p>
            ) : (
              <div className="space-y-3">
                {stats.near_expired.map((user) => (
                  <div key={user.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-gray-800">{user.nama}</p>
                      <p className="text-xs text-gray-500">{user.callsign || 'No Callsign'}</p>
                    </div>
                    <span className="text-xs text-red-500 font-bold">
                      {user.expiredAt ? new Date(user.expiredAt).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 border-t border-gray-700 text-sm">
        <p>© 2026 ORARI Lokal Aceh Besar. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
