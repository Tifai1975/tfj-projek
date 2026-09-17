import unittest
import json
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import async_session
from app.models.user import User
from app.models.transaksi import Transaksi
from app.models.berita import Berita
from app.models.galeri import Galeri
from app.models.pengumuman import Pengumuman
from app.models.kegiatan import Kegiatan
from app.core.security import create_access_token
from werkzeug.security import generate_password_hash
from sqlalchemy import delete, select
import os
import asyncio

class OrariTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure database tables exist
        import asyncio
        from app.core.database import engine, Base
        async def create_tables():
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        asyncio.run(create_tables())

    def setUp(self):
        os.environ['TESTING'] = 'True'
        os.environ['JWT_SECRET_KEY'] = 'super-secret-key-that-is-very-long-32-bytes'
        self.client = TestClient(app)
        self._cleanup_all_test_data()
        self.test_user = self._create_user(
            email="test@orari.com", nama="Test User",
            callsign="YB6TEST", role="ADMIN"
        )
        self.token = create_access_token({"sub": self.test_user.id, "role": self.test_user.role})
        self.headers = {'Authorization': f'Bearer {self.token}'}

    def tearDown(self):
        self._cleanup_all_test_data()

    def _cleanup_all_test_data(self):
        """Delete ALL test data from all tables to ensure clean state."""
        async def _run():
            async with async_session() as session:
                await session.execute(delete(Transaksi))
                await session.execute(delete(Berita))
                await session.execute(delete(Galeri))
                await session.execute(delete(Pengumuman))
                await session.execute(delete(Kegiatan))
                await session.execute(delete(User).where(User.email.like('%@orari.com')))
                await session.commit()
        asyncio.run(_run())

    def _create_test_admin(self):
        """Create the main admin test user."""
        self._create_user(
            email="test@orari.com", nama="Test User",
            callsign="YB6TEST", role="ADMIN"
        )

    def _create_user(self, email, nama, callsign, role="UMUM"):
        async def _run():
            async with async_session() as session:
                user = User(
                    email=email, password=generate_password_hash("password123"),
                    nama=nama, callsign=callsign, role=role, status="AKTIF"
                )
                session.add(user)
                await session.commit()
                await session.refresh(user)
                return user
        return asyncio.run(_run())

    def test_auth_and_transactions(self):
        res = self.client.post('/api/auth/register', json={
            'email': 'test2@orari.com', 'password': 'password123',
            'nama': 'Test User 2', 'callsign': 'YB6TEST2'
        })
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.content)
        self.assertEqual(data['nama'], 'Test User 2')

        res = self.client.post('/api/auth/login', json={
            'email': 'test@orari.com', 'password': 'password123'
        })
        self.assertEqual(res.status_code, 200)
        login_data = json.loads(res.content)
        token = login_data['token']
        headers = {'Authorization': f'Bearer {token}'}

        res = self.client.post('/api/transactions', json={
            'type': 'IURAN', 'jumlah': 100000.0,
            'buktiTransfer': 'bukti.jpg', 'keterangan': 'Iuran 2026'
        }, headers=headers)
        self.assertEqual(res.status_code, 201)

        res = self.client.get('/api/transactions', headers=headers)
        self.assertEqual(res.status_code, 200)
        txs = json.loads(res.content)
        self.assertEqual(len(txs), 1)
        self.assertEqual(txs[0]['type'], 'IURAN')
        self.assertEqual(txs[0]['status'], 'PENDING')

    def test_berita_create(self):
        data = {'judul': 'Test Berita', 'konten': 'Test konten berita'}
        res = self.client.post('/api/berita', data=data, headers=self.headers)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.content)
        self.assertEqual(data['judul'], 'Test Berita')
        self.assertIn('id', data)

        from io import BytesIO
        sample_image = BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + b"x" * 100)
        res = self.client.post(
            '/api/berita',
            data={'judul': 'Test Berita 2', 'konten': 'Test konten'},
            files={'image': ('test.jpg', sample_image, 'image/jpeg')},
            headers=self.headers
        )
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.content)
        self.assertEqual(data['judul'], 'Test Berita 2')
        self.assertIn('image_url', data)

    def test_berita_get_all(self):
        res = self.client.get('/api/berita')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        self.assertIsInstance(data, list)

    def test_berita_get_by_id_not_found(self):
        res = self.client.get('/api/berita/999')
        self.assertEqual(res.status_code, 404)

    def test_berita_update(self):
        data = {'judul': 'Original Judul', 'konten': 'Original Konten'}
        res = self.client.post('/api/berita', data=data, headers=self.headers)
        berita_id = json.loads(res.content)['id']
        update_data = {'judul': 'Updated Judul', 'konten': 'Updated Konten'}
        res = self.client.put(f'/api/berita/{berita_id}', data=update_data, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        self.assertEqual(data['judul'], 'Updated Judul')
        self.assertEqual(data['konten'], 'Updated Konten')

        from io import BytesIO
        sample_image = BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + b"x" * 100)
        res = self.client.put(
            f'/api/berita/{berita_id}',
            data={'judul': 'Updated Judul 2'},
            files={'image': ('test2.jpg', sample_image, 'image/jpeg')},
            headers=self.headers
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        self.assertEqual(data['judul'], 'Updated Judul 2')
        self.assertIn('image_url', data)

    def test_berita_delete(self):
        data = {'judul': 'To Delete', 'konten': 'Will be deleted'}
        res = self.client.post('/api/berita', data=data, headers=self.headers)
        berita_id = json.loads(res.content)['id']
        res = self.client.delete(f'/api/berita/{berita_id}', headers=self.headers)
        self.assertEqual(res.status_code, 204)
        res = self.client.get(f'/api/berita/{berita_id}')
        self.assertEqual(res.status_code, 404)

    def test_galeri_create(self):
        from io import BytesIO
        sample_image = BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + b"x" * 100)
        data = {'judul': 'Test Galeri', 'deskripsi': 'Test deskripsi galeri'}
        res = self.client.post(
            '/api/galeri',
            data=data,
            files={'image': ('test.jpg', sample_image, 'image/jpeg')},
            headers=self.headers
        )
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.content)
        self.assertEqual(data['judul'], 'Test Galeri')
        self.assertIn('image_url', data)

    def test_galeri_get_all(self):
        res = self.client.get('/api/galeri')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        self.assertIsInstance(data, list)

    def test_galeri_get_by_id_not_found(self):
        res = self.client.get('/api/galeri/999')
        self.assertEqual(res.status_code, 404)

    def test_galeri_update(self):
        from io import BytesIO
        sample_image = BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + b"x" * 100)
        data = {'judul': 'Original Judul', 'deskripsi': 'Original Deskripsi'}
        res = self.client.post('/api/galeri', data=data, files={'image': ('test.jpg', sample_image, 'image/jpeg')}, headers=self.headers)
        galeri_id = json.loads(res.content)['id']
        sample_image2 = BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + b"x" * 100)
        update_data = {'judul': 'Updated Judul', 'deskripsi': 'Updated Deskripsi'}
        res = self.client.put(
            f'/api/galeri/{galeri_id}',
            data=update_data,
            files={'image': ('test2.jpg', sample_image2, 'image/jpeg')},
            headers=self.headers
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        self.assertEqual(data['judul'], 'Updated Judul')
        self.assertEqual(data['deskripsi'], 'Updated Deskripsi')
        self.assertIn('image_url', data)

    def test_galeri_delete(self):
        from io import BytesIO
        sample_image = BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + b"x" * 100)
        data = {'judul': 'To Delete', 'deskripsi': 'Will be deleted'}
        res = self.client.post('/api/galeri', data=data, files={'image': ('test.jpg', sample_image, 'image/jpeg')}, headers=self.headers)
        galeri_id = json.loads(res.content)['id']
        res = self.client.delete(f'/api/galeri/{galeri_id}', headers=self.headers)
        self.assertEqual(res.status_code, 204)
        res = self.client.get(f'/api/galeri/{galeri_id}')
        self.assertEqual(res.status_code, 404)

    def test_non_admin_cannot_create_berita(self):
        user = self._create_user(email="user@orari.com", nama="Regular User", callsign="YBUSER", role="UMUM")
        token = create_access_token({"sub": user.id, "role": user.role})
        headers = {'Authorization': f'Bearer {token}'}
        data = {'judul': 'Test Berita', 'konten': 'Test konten'}
        res = self.client.post('/api/berita', data=data, headers=headers)
        self.assertEqual(res.status_code, 403)

    def test_berita_image_too_large(self):
        from io import BytesIO
        large_content = b"x" * (11 * 1024 * 1024)
        sample_image = BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + large_content)
        data = {'judul': 'Test Berita', 'konten': 'Test konten'}
        res = self.client.post(
            '/api/berita',
            data=data,
            files={'image': ('large.jpg', sample_image, 'image/jpeg')},
            headers=self.headers
        )
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.content)
        self.assertIn('detail', data)

if __name__ == '__main__':
    unittest.main()