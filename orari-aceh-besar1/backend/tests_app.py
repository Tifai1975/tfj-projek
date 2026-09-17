import unittest
import json
from app import create_app
from models.models import db, User, Transaksi

class OrariTestCase(unittest.TestCase):
    def setUp(self):
        import os
        os.environ['TESTING'] = 'True'
        os.environ['JWT_SECRET_KEY'] = 'super-secret-key-that-is-very-long-32-bytes'
        self.app = create_app()
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_auth_and_transactions(self):
        # 1. Register
        res = self.client.post('/api/auth/register', json={
            'email': 'test@orari.com',
            'password': 'password123',
            'nama': 'Test User',
            'callsign': 'YB6TEST'
        })
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data['nama'], 'Test User')
        
        # 2. Login
        res = self.client.post('/api/auth/login', json={
            'email': 'test@orari.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 200)
        login_data = json.loads(res.data)
        token = login_data['token']
        
        # 3. Create transaction
        headers = {'Authorization': f'Bearer {token}'}
        res = self.client.post('/api/transactions', json={
            'type': 'IURAN',
            'jumlah': 100000.0,
            'buktiTransfer': 'bukti.jpg',
            'keterangan': 'Iuran 2026'
        }, headers=headers)
        print("Tx Response:", res.status_code, res.data)
        self.assertEqual(res.status_code, 201)
        
        # 4. Get transactions
        res = self.client.get('/api/transactions', headers=headers)
        self.assertEqual(res.status_code, 200)
        txs = json.loads(res.data)
        self.assertEqual(len(txs), 1)
        self.assertEqual(txs[0]['type'], 'IURAN')
        self.assertEqual(txs[0]['status'], 'PENDING')

if __name__ == '__main__':
    unittest.main()
