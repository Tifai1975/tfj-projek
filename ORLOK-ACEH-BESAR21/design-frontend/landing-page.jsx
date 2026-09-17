'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-orari-navy">
      <div className="absolute inset-0 bg-gradient-to-br from-orari-navy via-orari-navy-light to-orari-navy-dark"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orari-red rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orari-yellow rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orari-red rounded-lg flex items-center justify-center animate-float">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wider text-orari-yellow uppercase">ORARI Lokal Aceh Besar</h2>
                <p className="text-xs text-gray-300">Organisasi Amatir Radio Indonesia</p>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              Portal Informasi &<br/>
              <span className="text-orari-red">Transaksi</span> Anggota
            </h1>
            
            <p className="text-lg text-gray-300 max-w-lg">
              Layanan administrasi keanggotaan ORARI Lokal Aceh Besar — iuran, donasi, 
              update data callsign, dan informasi kegiatan amatir radio di wilayah Aceh Besar.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register" className="btn-primary text-center">
                Daftar Anggota
              </Link>
              <Link href="/login" className="btn-secondary text-center">
                Login Anggota
              </Link>
            </div>
          </div>
          
          <div className="relative flex items-center justify-center">
            <div className="w-80 h-80 md:w-96 md:h-96 relative">
              <div className="absolute inset-0 border-4 border-orari-red/30 rounded-full animate-pulse-slow"></div>
              <div className="absolute inset-8 border-4 border-orari-yellow/30 rounded-full animate-pulse-slow" style={{animationDelay: '1s'}}></div>
              <div className="absolute inset-16 bg-orari-navy rounded-full flex items-center justify-center border-4 border-orari-red/50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-orari-red rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                  </div>
                  <span className="text-white font-bold text-lg">ORARI</span>
                  <span className="text-orari-yellow text-sm block">ACEH BESAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      title: 'Berita & Pengumuman',
      desc: 'Update terbaru seputar kegiatan dan pengumuman organisasi.',
      color: 'orari-red',
      bgClass: 'bg-red-50',
      textClass: 'text-orari-red',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Galeri Foto',
      desc: 'Koleksi foto kegiatan organisasi, event, dan dokumentasi.',
      color: 'orari-yellow',
      bgClass: 'bg-yellow-50',
      textClass: 'text-orari-yellow',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Transaksi',
      desc: 'Pengelolaan iuran, donasi, dan verifikasi bukti transfer.',
      color: 'navy',
      bgClass: 'bg-blue-50',
      textClass: 'text-orari-navy',
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-orari-navy mb-4">Fitur Utama</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Portal terintegrasi untuk kebutuhan administrasi dan informasi keanggotaan ORARI.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="card-hover p-8">
              <div className={`w-16 h-16 ${feature.bgClass} rounded-xl flex items-center justify-center mb-6 ${feature.textClass}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-orari-navy mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsRow() {
  const [stats, setStats] = useState({ active_members_count: 0, activities: [], announcements: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statItems = [
    { label: 'Anggota Aktif', value: stats.active_members_count || 0, suffix: '' },
    { label: 'Agenda Kegiatan', value: stats.activities ? stats.activities.length : 0, suffix: '' },
    { label: 'Pengumuman', value: stats.announcements ? stats.announcements.length : 0, suffix: '' },
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statItems.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
              <div className="text-5xl font-extrabold text-orari-red mb-2">
                {loading ? (
                  <span className="inline-block w-16 h-12 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  <>
                    {stat.value}
                    <span className="text-3xl font-bold text-orari-red">{stat.suffix}</span>
                  </>
                )}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/pengumuman`)
      .then(res => res.json())
      .then(data => {
        setAnnouncements(Array.isArray(data) ? data.slice(0, 3) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-orari-navy mb-2">Pengumuman Terbaru</h2>
            <p className="text-gray-600">Informasi dan berita terbaru dari organisasi.</p>
          </div>
          <Link href="/dashboard" className="hidden md:inline-block text-orari-red font-semibold hover:underline">
            Lihat Semua →
          </Link>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-100 rounded-xl p-6 h-48 animate-pulse"></div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Belum ada pengumuman saat ini.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {announcements.map((ann, idx) => (
              <div key={ann.id || idx} className="card-hover p-6 border-l-4 border-orari-red hover:border-orari-red transition-colors">
                <span className="text-xs text-gray-400 font-medium">
                  {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
                <h3 className="text-lg font-bold text-orari-navy mt-2 mb-3">{ann.judul}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{ann.konten}</p>
                <Link href="/dashboard" className="text-orari-red text-sm font-semibold mt-4 inline-block hover:underline">
                  Baca Selengkapnya →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ActivitySection() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/kegiatan`)
      .then(res => res.json())
      .then(data => {
        setActivities(Array.isArray(data) ? data.slice(0, 3) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding bg-orari-navy text-white">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Agenda Kegiatan</h2>
          <p className="text-gray-300">Jadwal kegiatan dan event organisasi.</p>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/10 rounded-xl p-6 h-48 animate-pulse"></div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Belum ada agenda kegiatan mendatang.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {activities.map((act, idx) => (
              <div key={act.id || idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-orari-yellow rounded-full"></div>
                  <span className="text-orari-yellow text-sm font-semibold uppercase tracking-wide">
                    {act.tanggal ? new Date(act.tanggal).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : '-'}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{act.nama}</h3>
                <p className="text-gray-300 text-sm mb-3">{act.deskripsi}</p>
                <div className="flex items-center text-gray-400 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {act.lokasi || 'Lokasi TBD'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-orari-navy-dark text-gray-400 py-12">
      <div className="container-max">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orari-red rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg">ORARI Aceh Besar</span>
            </div>
            <p className="text-sm">Portal informasi dan transaksi anggota ORARI Lokal Aceh Besar.</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition">Beranda</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Daftar Anggota</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@orari-aceh-besar.org
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                24/7 Support
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Organisasi</h4>
            <p className="text-sm mb-2">ORARI Lokal Aceh Besar</p>
            <p className="text-sm">Anggota Perkumpulan Amatir Radio Indonesia</p>
            <div className="mt-4 flex space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">FB</span>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">IG</span>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">YT</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} ORARI Lokal Aceh Besar. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <FeatureGrid />
      <StatsRow />
      <AnnouncementSection />
      <ActivitySection />
      <Footer />
    </div>
  );
}