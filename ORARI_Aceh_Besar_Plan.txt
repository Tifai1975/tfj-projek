# ORARI Aceh Besar Web Application - Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a full-stack membership management system for ORARI Aceh Besar with member registration, payment tracking, admin dashboard, and public information pages.

**Architecture:** 
- Frontend: Next.js 14+ (App Router) with TypeScript, Tailwind CSS, Shadcn/ui
- Backend: Node.js + Express REST API with JWT authentication
- Database: SQLite (dev) → PostgreSQL (production)
- ORM: Prisma
- Deployment: Docker Compose on self-hosted VPS

**Tech Stack:**
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui, React Hook Form, Zod, TanStack Query
- Backend: Node.js 18+, Express, Prisma, JWT, Bcrypt, Multer, Nodemailer
- Database: PostgreSQL 15+ (production), SQLite (development)
- Payment: Manual bank transfer (member uploads receipt, admin approve/reject)
- Email: SMTP (Gmail/SendGrid for password reset)
- DevOps: Docker, Docker Compose, Nginx reverse proxy

---

## PHASE 1: Project Setup & Infrastructure

### Task 1.1: Initialize project structure

**Objective:** Create base directory and initialize git

**Files:**
- Create: `/Users/tfj/Documents/Projek Hermes/orari-aceh-besar/`

**Step 1: Create directory**
```bash
cd "/Users/tfj/Documents/Projek Hermes"
mkdir orari-aceh-besar
cd orari-aceh-besar
```

**Step 2: Initialize git**
```bash
git init
```

**Step 3: Create .gitignore**
```bash
cat > .gitignore << 'EOF'
node_modules/
.next/
.env
.env*.local
backend/prisma/dev.db
backend/prisma/dev.db-journal
backend/uploads/
.DS_Store
dist/
build/
EOF
```

**Step 4: Create README**
```bash
cat > README.md << 'EOF'
# ORARI Aceh Besar Web Application

Membership management system for ORARI Aceh Besar radio amateur organization.

## Tech Stack
- Frontend: Next.js 14 + TypeScript
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL
- Deployment: Docker Compose

## Getting Started
See docs/ for setup instructions.
EOF
```

**Step 5: Commit**
```bash
git add .
git commit -m "chore: initialize project"
```

---

### Task 1.2: Setup backend with Express and Prisma

**Objective:** Initialize Node.js backend with TypeScript

**Step 1: Create backend directory**
```bash
mkdir backend
cd backend
npm init -y
```

**Step 2: Install dependencies**
```bash
npm install express cors dotenv bcrypt jsonwebtoken multer nodemailer
npm install -D typescript @types/express @types/node @types/cors @types/bcrypt @types/jsonwebtoken @types/multer @types/nodemailer ts-node nodemon prisma
```

**Step 3: Initialize Prisma**
```bash
npx prisma init --datasource-provider sqlite
```

**Step 4: Create tsconfig.json**
```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
```

**Step 5: Update package.json scripts**
```bash
npm pkg set scripts.dev="nodemon src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/index.js"
```

**Step 6: Create .env.example**
```bash
cat > .env.example << 'EOF'
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
JWT_ACCESS_SECRET=change-this-in-production
JWT_REFRESH_SECRET=change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
XENDIT_SECRET_KEY=xnd_development_xxxxx
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE_MB=5
UPLOAD_PATH=./uploads
EOF
```

**Step 7: Copy to .env**
```bash
cp .env.example .env
```

**Step 8: Create basic Express server**
```bash
mkdir -p src
cat > src/index.ts << 'EOF'
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
EOF
```

**Step 9: Test server**
```bash
npm run dev
```
Expected: `🚀 Backend running on http://localhost:5000`

Press Ctrl+C to stop.

**Step 10: Commit**
```bash
cd ..
git add backend/
git commit -m "feat(backend): initialize Express with TypeScript"
```

---

### Task 1.3: Create Prisma schema

**Objective:** Define complete database schema

**Step 1: Replace prisma/schema.prisma**
```bash
cd backend
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum UserRole {
  PUBLIC
  MEMBER
  ADMIN
}

enum TransactionType {
  MEMBERSHIP_FEE
  DONATION
  EVENT_FEE
}

enum TransactionStatus {
  PENDING
  APPROVED
  REJECTED
}

enum MembershipStatus {
  ACTIVE
  EXPIRED
  SUSPENDED
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  role          UserRole  @default(PUBLIC)
  isVerified    Boolean   @default(false)
  resetToken    String?
  resetTokenExp DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  member        Member?
}

model Member {
  id              String           @id @default(uuid())
  callSign        String           @unique
  name            String
  address         String
  phone           String
  membershipStart DateTime
  membershipEnd   DateTime
  status          MembershipStatus @default(ACTIVE)
  userId          String           @unique
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
}

model Transaction {
  id          String            @id @default(uuid())
  type        TransactionType
  amount      Float
  status      TransactionStatus @default(PENDING)
  receiptUrl  String?
  notes       String?
  paymentDate DateTime?
  memberId    String
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
}

model Activity {
  id          String    @id @default(uuid())
  title       String
  description String
  startDate   DateTime
  endDate     DateTime?
  location    String
  isPublic    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model News {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  content     String
  excerpt     String?
  authorId    String
  isPublished Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Frequency {
  id        String   @id @default(uuid())
  band      String
  frequency String
  mode      String
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
EOF
```

**Step 2: Create migration**
```bash
npx prisma migrate dev --name init
```
Expected: `Migration created successfully`

**Step 3: Generate Prisma Client**
```bash
npx prisma generate
```

**Step 4: Commit**
```bash
cd ..
git add backend/prisma/schema.prisma
git commit -m "feat(backend): add Prisma database schema"
```

---

## PHASE 2: Backend Authentication

### Task 2.1: Create JWT utilities

**Objective:** Implement JWT token generation and verification

**Step 1: Create utils directory and JWT file**
```bash
cd backend
mkdir -p src/utils
cat > src/utils/jwt.ts << 'EOF'
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
};
EOF
```

**Step 2: Commit**
```bash
cd ..
git add backend/src/utils/jwt.ts
git commit -m "feat(backend): add JWT utilities"
```

---

### Task 2.2: Create password utilities

**Objective:** Implement bcrypt password hashing

**Step 1: Create password utility**
```bash
cd backend
cat > src/utils/password.ts << 'EOF'
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
EOF
```

**Step 2: Commit**
```bash
cd ..
git add backend/src/utils/password.ts
git commit -m "feat(backend): add password hashing utilities"
```

---

### Task 2.3: Create auth middleware

**Objective:** Implement JWT authentication middleware

**Step 1: Create middleware**
```bash
cd backend
mkdir -p src/middleware
cat > src/middleware/auth.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    
    next();
  };
};
EOF
```

**Step 2: Commit**
```bash
cd ..
git add backend/src/middleware/auth.ts
git commit -m "feat(backend): add authentication middleware"
```

---

### Task 2.4: Create auth routes (register, login, refresh)

**Objective:** Implement authentication endpoints

**Step 1: Create Prisma client instance**
```bash
cd backend
cat > src/utils/prisma.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
EOF
```

**Step 2: Create auth routes**
```bash
mkdir -p src/routes
cat > src/routes/auth.ts << 'EOF'
import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, callSign, phone, address } = req.body;
    
    // Validate input
    if (!email || !password || !name || !callSign) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    
    // Check if callSign exists
    const existingMember = await prisma.member.findUnique({ where: { callSign } });
    if (existingMember) {
      res.status(409).json({ error: 'Call sign already registered' });
      return;
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user and member
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'MEMBER',
        member: {
          create: {
            callSign,
            name,
            address: address || '',
            phone: phone || '',
            membershipStart: new Date(),
            membershipEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            status: 'ACTIVE'
          }
        }
      },
      include: { member: true }
    });
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        member: user.member
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { member: true }
    });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Generate tokens
    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        member: user.member
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    const payload = { userId: decoded.userId, role: decoded.role };
    const newAccessToken = generateAccessToken(payload);
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
EOF
```

**Step 3: Update src/index.ts to use auth routes**
```bash
cat > src/index.ts << 'EOF'
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
EOF
```

**Step 4: Test registration endpoint**
```bash
# Start server in background
npm run dev &
sleep 3

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "callSign": "YB0TEST",
    "phone": "08123456789",
    "address": "Test Address"
  }'

# Stop server
pkill -f "npm run dev"
```

Expected: 201 response with user data

**Step 5: Commit**
```bash
cd ..
git add backend/
git commit -m "feat(backend): add auth routes (register, login, refresh)"
```

---

## PHASE 3: Backend - Member Management

### Task 3.1: GET /api/members/me (current user profile)

**Objective:** Let logged-in member view their own profile

**Step 1: Create members route file**

Create `backend/src/routes/members.ts`:

```typescript
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/members/me - current user's member profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const member = await prisma.member.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { email: true, role: true } } }
    });

    if (!member) {
      res.status(404).json({ error: 'Member profile not found' });
      return;
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
```

**Step 2: Register route in src/index.ts**

Add after `app.use('/api/auth', authRoutes);`:

```typescript
import memberRoutes from './routes/members';
app.use('/api/members', memberRoutes);
```

**Step 3: Commit**
```bash
git add backend/src/routes/members.ts backend/src/index.ts
git commit -m "feat(backend): add GET /api/members/me endpoint"
```

---

### Task 3.2: GET /api/members (list all, admin only)

**Objective:** Admin can list all members with pagination and search

**Step 1: Add to backend/src/routes/members.ts**

```typescript
// GET /api/members - list all members (admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { callSign: { contains: String(search) } }
      ];
    }
    if (status) where.status = String(status);

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: { user: { select: { email: true, role: true } } },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.member.count({ where })
    ]);

    res.json({ members, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});
```

**Step 2: Commit**
```bash
git add backend/src/routes/members.ts
git commit -m "feat(backend): add GET /api/members (admin, paginated)"
```

---

### Task 3.3: GET /api/members/:id (view single member)

**Objective:** View a specific member's details

**Step 1: Add to backend/src/routes/members.ts**

```typescript
// GET /api/members/:id - view single member
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true, role: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Non-admin can only view their own profile
    if (req.user!.role !== 'ADMIN' && member.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});
```

**Step 2: Commit**
```bash
git add backend/src/routes/members.ts
git commit -m "feat(backend): add GET /api/members/:id endpoint"
```

---

### Task 3.4: PUT /api/members/:id (update member profile)

**Objective:** Member can update their own profile, admin can update any

**Step 1: Add to backend/src/routes/members.ts**

```typescript
// PUT /api/members/:id - update member
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.member.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Non-admin can only update their own profile
    if (req.user!.role !== 'ADMIN' && existing.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { name, address, phone } = req.body;
    // callSign is immutable after creation

    const updated = await prisma.member.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(phone && { phone })
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});
```

**Step 2: Commit**
```bash
git add backend/src/routes/members.ts
git commit -m "feat(backend): add PUT /api/members/:id endpoint"
```

---

### Task 3.5: Membership expiry checker utility

**Objective:** Utility to check/update expired memberships with 14-day grace period

**Step 1: Create expiry checker**

Create `backend/src/utils/membership.ts`:

```typescript
import { prisma } from './prisma';

const GRACE_PERIOD_DAYS = 14;

export const checkMembershipExpiry = async () => {
  const now = new Date();

  // Find members whose membership has expired beyond grace period
  const graceDate = new Date(now);
  graceDate.setDate(graceDate.getDate() - GRACE_PERIOD_DAYS);

  // Suspend members past grace period
  const suspended = await prisma.member.updateMany({
    where: {
      status: 'ACTIVE',
      membershipEnd: { lt: graceDate }
    },
    data: { status: 'SUSPENDED' }
  });

  // Mark as expired (within grace period)
  const expired = await prisma.member.updateMany({
    where: {
      status: 'ACTIVE',
      membershipEnd: { lt: now, gte: graceDate }
    },
    data: { status: 'EXPIRED' }
  });

  return { suspended: suspended.count, expired: expired.count };
};

export const extendMembership = async (memberId: string, months: number = 12) => {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new Error('Member not found');

  const newEnd = new Date(
    member.membershipEnd > new Date() ? member.membershipEnd : new Date()
  );
  newEnd.setMonth(newEnd.getMonth() + months);

  return prisma.member.update({
    where: { id: memberId },
    data: {
      membershipEnd: newEnd,
      status: 'ACTIVE'
    }
  });
};
```

**Step 2: Add cron-like check to server startup**

Add to `backend/src/index.ts` before `app.listen`:

```typescript
import { checkMembershipExpiry } from './utils/membership';

// Check membership expiry every 24 hours
setInterval(async () => {
  const result = await checkMembershipExpiry();
  if (result.suspended || result.expired) {
    console.log(`Membership check: ${result.expired} expired, ${result.suspended} suspended`);
  }
}, 24 * 60 * 60 * 1000);

// Run once on startup
checkMembershipExpiry().then(r => {
  console.log(`Initial membership check: ${r.expired} expired, ${r.suspended} suspended`);
});
```

**Step 3: Commit**
```bash
git add backend/src/utils/membership.ts backend/src/index.ts
git commit -m "feat(backend): add membership expiry checker with 14-day grace"
```

---

## PHASE 4: Backend - Transactions (Manual Transfer)

### Task 4.1: Setup Multer for file uploads

**Objective:** Configure file upload middleware for receipt images

**Step 1: Create upload middleware**

Create `backend/src/middleware/upload.ts`:

```typescript
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_PATH || './uploads/receipts';

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
};

export const uploadReceipt = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
```

**Step 2: Serve uploaded files statically**

Add to `backend/src/index.ts`:

```typescript
import path from 'path';

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
```

**Step 3: Commit**
```bash
git add backend/src/middleware/upload.ts backend/src/index.ts
git commit -m "feat(backend): add Multer upload middleware for receipts"
```

---

### Task 4.2: POST /api/transactions (submit payment with receipt)

**Objective:** Member submits payment with receipt image upload

**Step 1: Create transactions route**

Create `backend/src/routes/transactions.ts`:

```typescript
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadReceipt } from '../middleware/upload';

const router = Router();

// POST /api/transactions - submit payment with receipt
router.post('/', authenticate, uploadReceipt.single('receipt'), async (req: AuthRequest, res: Response) => {
  try {
    const member = await prisma.member.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!member) {
      res.status(404).json({ error: 'Member profile not found' });
      return;
    }

    const { type, amount, notes } = req.body;

    if (!type || !amount) {
      res.status(400).json({ error: 'Type and amount are required' });
      return;
    }

    const validTypes = ['MEMBERSHIP_FEE', 'DONATION', 'EVENT_FEE'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: 'Invalid transaction type' });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        status: 'PENDING',
        receiptUrl: req.file ? `/uploads/receipts/${req.file.filename}` : null,
        notes: notes || null,
        paymentDate: new Date(),
        memberId: member.id
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default router;
```

**Step 2: Register route in src/index.ts**

```typescript
import transactionRoutes from './routes/transactions';
app.use('/api/transactions', transactionRoutes);
```

**Step 3: Commit**
```bash
git add backend/src/routes/transactions.ts backend/src/index.ts
git commit -m "feat(backend): add POST /api/transactions with receipt upload"
```

---

### Task 4.3: GET /api/transactions (list with filters)

**Objective:** List transactions, filterable by member and status

**Step 1: Add to backend/src/routes/transactions.ts**

```typescript
// GET /api/transactions - list transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Non-admin can only see their own transactions
    if (req.user!.role !== 'ADMIN') {
      const member = await prisma.member.findUnique({
        where: { userId: req.user!.userId }
      });
      if (!member) {
        res.status(404).json({ error: 'Member not found' });
        return;
      }
      where.memberId = member.id;
    }

    if (status) where.status = String(status);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { member: { select: { name: true, callSign: true } } },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({ transactions, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});
```

**Step 2: Commit**
```bash
git add backend/src/routes/transactions.ts
git commit -m "feat(backend): add GET /api/transactions with filters"
```

---

### Task 4.4: PUT /api/transactions/:id/approve (admin approve)

**Objective:** Admin approves payment and auto-extends membership for MEMBERSHIP_FEE

**Step 1: Add to backend/src/routes/transactions.ts**

```typescript
import { extendMembership } from '../utils/membership';

// PUT /api/transactions/:id/approve - admin approve
router.put('/:id/approve', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id }
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    if (transaction.status !== 'PENDING') {
      res.status(400).json({ error: 'Transaction is not pending' });
      return;
    }

    const updated = await prisma.transaction.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' }
    });

    // Auto-extend membership if MEMBERSHIP_FEE
    if (transaction.type === 'MEMBERSHIP_FEE') {
      await extendMembership(transaction.memberId, 12);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve transaction' });
  }
});
```

**Step 2: Commit**
```bash
git add backend/src/routes/transactions.ts
git commit -m "feat(backend): add approve transaction with auto-extend membership"
```

---

### Task 4.5: PUT /api/transactions/:id/reject (admin reject)

**Objective:** Admin rejects payment with optional reason

**Step 1: Add to backend/src/routes/transactions.ts**

```typescript
// PUT /api/transactions/:id/reject - admin reject
router.put('/:id/reject', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id }
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    if (transaction.status !== 'PENDING') {
      res.status(400).json({ error: 'Transaction is not pending' });
      return;
    }

    const updated = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        notes: req.body.reason || transaction.notes
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject transaction' });
  }
});
```

**Step 2: Commit**
```bash
git add backend/src/routes/transactions.ts
git commit -m "feat(backend): add reject transaction endpoint"
```

---

## PHASE 5: Backend - Activities, News, Frequencies

### Task 5.1: Activities CRUD

**Objective:** Full CRUD for activities (admin create/update/delete, all can read)

**Step 1: Create activities route**

Create `backend/src/routes/activities.ts`:

```typescript
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/activities - list all
router.get('/', async (req, res: Response) => {
  try {
    const { upcoming } = req.query;
    const where: any = {};
    if (upcoming === 'true') {
      where.startDate = { gte: new Date() };
    }
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { startDate: 'asc' }
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// POST /api/activities - create (admin)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate, location, isPublic } = req.body;
    if (!title || !description || !startDate || !location) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        isPublic: isPublic ?? true
      }
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// PUT /api/activities/:id - update (admin)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate, location, isPublic } = req.body;
    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(location && { location }),
        ...(isPublic !== undefined && { isPublic })
      }
    });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// DELETE /api/activities/:id - delete (admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.activity.delete({ where: { id: req.params.id } });
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

export default router;
```

**Step 2: Register in src/index.ts**

```typescript
import activityRoutes from './routes/activities';
app.use('/api/activities', activityRoutes);
```

**Step 3: Commit**
```bash
git add backend/src/routes/activities.ts backend/src/index.ts
git commit -m "feat(backend): add Activities CRUD endpoints"
```

---

### Task 5.2: News CRUD with slug generation

**Objective:** Full CRUD for news articles with auto-generated slugs

**Step 1: Create news route**

Create `backend/src/routes/news.ts`:

```typescript
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// GET /api/news - list published (public) or all (admin)
router.get('/', async (req, res: Response) => {
  try {
    const articles = await prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' }
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET /api/news/:slug - single article
router.get('/:slug', async (req, res: Response) => {
  try {
    const article = await prisma.news.findUnique({
      where: { slug: req.params.slug }
    });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/news - create (admin)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, excerpt, isPublished } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }
    const slug = slugify(title) + '-' + Date.now();
    const article = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200),
        authorId: req.user!.userId,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null
      }
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// PUT /api/news/:id - update (admin)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, excerpt, isPublished } = req.body;
    const data: any = {};
    if (title) { data.title = title; data.slug = slugify(title) + '-' + Date.now(); }
    if (content) data.content = content;
    if (excerpt) data.excerpt = excerpt;
    if (isPublished !== undefined) {
      data.isPublished = isPublished;
      if (isPublished) data.publishedAt = new Date();
    }
    const article = await prisma.news.update({
      where: { id: req.params.id },
      data
    });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE /api/news/:id - delete (admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.news.delete({ where: { id: req.params.id } });
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
```

**Step 2: Register in src/index.ts**

```typescript
import newsRoutes from './routes/news';
app.use('/api/news', newsRoutes);
```

**Step 3: Commit**
```bash
git add backend/src/routes/news.ts backend/src/index.ts
git commit -m "feat(backend): add News CRUD with slug generation"
```

---

### Task 5.3: Frequencies CRUD

**Objective:** Full CRUD for radio frequency database

**Step 1: Create frequencies route**

Create `backend/src/routes/frequencies.ts`:

```typescript
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/frequencies - list all (public)
router.get('/', async (req, res: Response) => {
  try {
    const { band, mode, search } = req.query;
    const where: any = {};
    if (band) where.band = String(band);
    if (mode) where.mode = String(mode);
    if (search) {
      where.OR = [
        { frequency: { contains: String(search) } },
        { notes: { contains: String(search) } }
      ];
    }
    const frequencies = await prisma.frequency.findMany({
      where,
      orderBy: { frequency: 'asc' }
    });
    res.json(frequencies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch frequencies' });
  }
});

// POST /api/frequencies - create (admin)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { band, frequency, mode, notes } = req.body;
    if (!band || !frequency || !mode) {
      res.status(400).json({ error: 'Band, frequency, and mode are required' });
      return;
    }
    const freq = await prisma.frequency.create({
      data: { band, frequency, mode, notes }
    });
    res.status(201).json(freq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create frequency' });
  }
});

// PUT /api/frequencies/:id - update (admin)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { band, frequency, mode, notes } = req.body;
    const freq = await prisma.frequency.update({
      where: { id: req.params.id },
      data: {
        ...(band && { band }),
        ...(frequency && { frequency }),
        ...(mode && { mode }),
        ...(notes !== undefined && { notes })
      }
    });
    res.json(freq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update frequency' });
  }
});

// DELETE /api/frequencies/:id - delete (admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.frequency.delete({ where: { id: req.params.id } });
    res.json({ message: 'Frequency deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete frequency' });
  }
});

export default router;
```

**Step 2: Register in src/index.ts**

```typescript
import frequencyRoutes from './routes/frequencies';
app.use('/api/frequencies', frequencyRoutes);
```

**Step 3: Commit**
```bash
git add backend/src/routes/frequencies.ts backend/src/index.ts
git commit -m "feat(backend): add Frequencies CRUD endpoints"
```

---

## PHASE 6: Backend - Admin Features

### Task 6.1: Admin dashboard stats

**Objective:** GET /api/admin/dashboard returns summary statistics

**Step 1: Create admin route**

Create `backend/src/routes/admin.ts`:

```typescript
import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/admin/dashboard - summary stats
router.get('/dashboard', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMembers,
      activeMembers,
      pendingPayments,
      revenueThisMonth
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count({ where: { status: 'PENDING' } }),
      prisma.transaction.aggregate({
        where: {
          status: 'APPROVED',
          createdAt: { gte: monthStart }
        },
        _sum: { amount: true }
      })
    ]);

    res.json({
      totalMembers,
      activeMembers,
      expiredMembers: totalMembers - activeMembers,
      pendingPayments,
      revenueThisMonth: revenueThisMonth._sum.amount || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
```

**Step 2: Register in src/index.ts**

```typescript
import adminRoutes from './routes/admin';
app.use('/api/admin', adminRoutes);
```

**Step 3: Commit**
```bash
git add backend/src/routes/admin.ts backend/src/index.ts
git commit -m "feat(backend): add admin dashboard stats endpoint"
```

---

### Task 6.2: Export members CSV

**Objective:** Admin can download members list as CSV

**Step 1: Add to backend/src/routes/admin.ts**

```typescript
// GET /api/admin/reports/members - export CSV
router.get('/reports/members', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const members = await prisma.member.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { name: 'asc' }
    });

    const header = 'Call Sign,Name,Email,Phone,Address,Status,Membership Start,Membership End\n';
    const rows = members.map(m =>
      `"${m.callSign}","${m.name}","${m.user.email}","${m.phone}","${m.address}","${m.status}","${m.membershipStart.toISOString().split('T')[0]}","${m.membershipEnd.toISOString().split('T')[0]}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export members' });
  }
});
```

**Step 2: Commit**
```bash
git add backend/src/routes/admin.ts
git commit -m "feat(backend): add members CSV export"
```

---

### Task 6.3: Export transactions CSV

**Objective:** Admin can download transactions as CSV

**Step 1: Add to backend/src/routes/admin.ts**

```typescript
// GET /api/admin/reports/transactions - export CSV
router.get('/reports/transactions', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { member: { select: { name: true, callSign: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const header = 'Date,Member,Call Sign,Type,Amount,Status,Notes\n';
    const rows = transactions.map(t =>
      `"${t.createdAt.toISOString().split('T')[0]}","${t.member.name}","${t.member.callSign}","${t.type}","${t.amount}","${t.status}","${t.notes || ''}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});
```

**Step 2: Commit**
```bash
git add backend/src/routes/admin.ts
git commit -m "feat(backend): add transactions CSV export"
```

---

### Task 6.4: Bulk email to all members

**Objective:** Admin sends email to all active members

**Step 1: Create email utility**

Create `backend/src/utils/email.ts`:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  return transporter.sendMail({
    from: `"ORARI Aceh Besar" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  });
};

export const sendBulkEmail = async (emails: string[], subject: string, html: string) => {
  const results = [];
  for (const email of emails) {
    try {
      await sendEmail(email, subject, html);
      results.push({ email, status: 'sent' });
    } catch (error) {
      results.push({ email, status: 'failed', error: (error as Error).message });
    }
  }
  return results;
};
```

**Step 2: Add bulk email endpoint to admin.ts**

```typescript
import { sendBulkEmail } from '../utils/email';

// POST /api/admin/email/bulk - send email to all members
router.post('/email/bulk', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      res.status(400).json({ error: 'Subject and message are required' });
      return;
    }

    const members = await prisma.member.findMany({
      where: { status: 'ACTIVE' },
      include: { user: { select: { email: true } } }
    });

    const emails = members.map(m => m.user.email);
    const results = await sendBulkEmail(emails, subject, message);

    res.json({
      total: emails.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      details: results
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send bulk email' });
  }
});
```

**Step 3: Commit**
```bash
git add backend/src/utils/email.ts backend/src/routes/admin.ts
git commit -m "feat(backend): add bulk email to members"
```

---

### Task 6.5: Password reset flow

**Objective:** Forgot password and reset password endpoints

**Step 1: Add to backend/src/routes/auth.ts**

```typescript
import crypto from 'crypto';
import { sendEmail } from '../utils/email';

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, a reset link has been sent' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(
      email,
      'Reset Password - ORARI Aceh Besar',
      `<p>Klik link berikut untuk reset password Anda:</p>
       <a href="${resetUrl}">${resetUrl}</a>
       <p>Link berlaku 1 jam.</p>`
    );

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() }
      }
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null
      }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});
```

**Step 2: Commit**
```bash
git add backend/src/routes/auth.ts
git commit -m "feat(backend): add password reset flow"
```

---

## PHASE 7: Frontend - Setup

### Task 7.1: Initialize Next.js 14 with TypeScript

**Objective:** Create frontend app with Next.js App Router

**Step 1: Create Next.js project**
```bash
cd /Users/tfj/Documents/Projek\ Hermes/orari-aceh-besar
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Next.js project created in `frontend/`

**Step 2: Commit**
```bash
git add frontend/
git commit -m "feat(frontend): initialize Next.js 14 with TypeScript"
```

---

### Task 7.2: Install Shadcn/ui

**Objective:** Add Shadcn/ui component library

**Step 1: Initialize Shadcn/ui**
```bash
cd frontend
npx shadcn@latest init -d
```

**Step 2: Install commonly needed components**
```bash
npx shadcn@latest add button card input label table badge dialog sheet tabs select textarea dropdown-menu avatar separator
```

**Step 3: Commit**
```bash
cd ..
git add frontend/
git commit -m "feat(frontend): add Shadcn/ui components"
```

---

### Task 7.3: Install TanStack Query and Axios

**Objective:** Setup data fetching layer

**Step 1: Install dependencies**
```bash
cd frontend
npm install @tanstack/react-query axios react-hook-form @hookform/resolvers zod
```

**Step 2: Create query provider**

Create `frontend/src/lib/query-provider.tsx`:

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1
      }
    }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Step 3: Wrap app in provider**

Update `frontend/src/app/layout.tsx`:

```tsx
import { QueryProvider } from '@/lib/query-provider';

// Inside RootLayout, wrap {children} with:
<QueryProvider>{children}</QueryProvider>
```

**Step 4: Commit**
```bash
cd ..
git add frontend/
git commit -m "feat(frontend): add TanStack Query and Axios"
```

---

### Task 7.4: Create API client utility

**Objective:** Centralized API client with auth token handling

**Step 1: Create API client**

Create `frontend/src/lib/api.ts`:

```typescript
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**Step 2: Commit**
```bash
git add frontend/src/lib/api.ts
git commit -m "feat(frontend): add API client with auth interceptors"
```

---

### Task 7.5: Create auth context

**Objective:** Global auth state management

**Step 1: Create auth context**

Create `frontend/src/lib/auth-context.tsx`:

```tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

interface User {
  id: string;
  email: string;
  role: 'PUBLIC' | 'MEMBER' | 'ADMIN';
  member?: {
    id: string;
    callSign: string;
    name: string;
    status: string;
    membershipEnd: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/api/members/me')
        .then(res => {
          setUser({
            id: res.data.userId,
            email: res.data.user.email,
            role: res.data.user.role,
            member: res.data
          });
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Step 2: Add AuthProvider to layout.tsx**

Update `frontend/src/app/layout.tsx`:

```tsx
import { AuthProvider } from '@/lib/auth-context';

// Wrap children:
<QueryProvider>
  <AuthProvider>{children}</AuthProvider>
</QueryProvider>
```

**Step 3: Commit**
```bash
cd ..
git add frontend/
git commit -m "feat(frontend): add auth context with login/logout"
```

---

## Implementation Notes (Updated)

**Plan Status:**
✅ Phase 1: Project setup & infrastructure
✅ Phase 2: Backend authentication
✅ Phase 3: Backend member management
✅ Phase 4: Backend transactions (manual transfer)
✅ Phase 5: Backend activities, news, frequencies
✅ Phase 6: Backend admin features
✅ Phase 7: Frontend setup

**Remaining Phases (see separate plan file):**
- Phase 8: Frontend public pages
- Phase 9: Frontend auth pages
- Phase 10: Frontend member dashboard
- Phase 11: Frontend admin dashboard
- Phase 12: Docker setup
- Phase 13: Testing & deployment docs


---

## PHASE 8: Frontend - Public Pages

All public pages use Next.js 14 App Router under `frontend/src/app/(public)/`.

### Task 8.1: Create public layout with Navbar and Footer

**Objective:** Set up shared layout for all public-facing pages with navigation and footer.

**Step 1: Create public layout with Navbar component**
```tsx
// frontend/src/app/(public)/layout.tsx
import Link from 'next/link'
import { ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            ORARI Aceh Besar
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/activities" className="hover:text-primary">Activities</Link>
            <Link href="/news" className="hover:text-primary">News</Link>
            <Link href="/frequencies" className="hover:text-primary">Frequencies</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/login" className="hover:text-primary font-semibold">Login</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} ORARI Aceh Besar. All rights reserved.</p>
          <p className="mt-1">Organisasi Amatir Radio Indonesia Daerah Aceh Besar</p>
        </div>
      </footer>
    </div>
  )
}
```
Expected: Layout wraps public routes with nav/footer.

**Step 2: Commit**
```bash
git add frontend/src/app/\(public\)/layout.tsx
git commit -m "feat(frontend): add public layout with navbar and footer"
```

### Task 8.2: Landing/home page

**Objective:** Build hero section, features overview, latest news preview, upcoming activities.

**Step 1: Create home page with hero, features, preview sections**
```tsx
// frontend/src/app/(public)/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">ORARI Aceh Besar</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Organisasi Amatir Radio Daerah Aceh Besar — connecting radio enthusiasts,
            serving community communication needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild><Link href="/register">Join Us</Link></Button>
            <Button variant="outline" asChild><Link href="/about">Learn More</Link></Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">What We Offer</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Membership Management</CardTitle>
              <CardDescription>Register, track dues, and manage your membership online.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activities & Events</CardTitle>
              <CardDescription>Stay updated with upcoming ham radio activities and events.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frequency Directory</CardTitle>
              <CardDescription>Browse and search licensed radio frequencies for Aceh Besar.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Latest News Preview */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Latest News</h2>
            <Button variant="outline" asChild><Link href="/news">View All</Link></Button>
          </div>
          <p className="text-muted-foreground">News feed will load from API.</p>
        </div>
      </section>

      {/* Upcoming Activities Preview */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Upcoming Activities</h2>
          <Button variant="outline" asChild><Link href="/activities">View All</Link></Button>
        </div>
        <p className="text-muted-foreground">Activities list will load from API.</p>
      </section>
    </div>
  )
}
```
Expected: Landing page with hero, features cards, news preview, activities preview.

**Step 2: Commit**
```bash
git add frontend/src/app/\(public\)/page.tsx
git commit -m "feat(frontend): add landing/home page"
```

### Task 8.3: About page

**Objective:** Organization info, mission, leadership structure.

**Step 1: Create about page**
```tsx
// frontend/src/app/(public)/about/page.tsx
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">About ORARI Aceh Besar</h1>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          ORARI Aceh Besar serves as the principal organization for amateur radio enthusiasts
          in the Aceh Besar region. We promote radio communication skills, emergency
          preparedness, community service, and technical education.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Leadership</h2>
        <p className="text-muted-foreground">Leadership structure will be managed via admin dashboard.</p>
      </section>
    </div>
  )
}
```
Expected: Static about page with mission and placeholder for leadership.

**Step 2: Commit**
```bash
git add frontend/src/app/\(public\)/about/page.tsx
git commit -m "feat(frontend): add about page"
```

### Task 8.4: Activities page

**Objective:** List upcoming/past events from API, card layout with date, title, location.

**Step 1: Create activities page with API fetch**
```tsx
// frontend/src/app/(public)/activities/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

async function fetchActivities() {
  const res = await fetch('/api/public/activities')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function ActivitiesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['public-activities'], queryFn: fetchActivities })

  if (isLoading) return <div className="container mx-auto px-4 py-16"><Skeleton className="h-40" /></div>

  const activities = data?.data || data || []

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Activities</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((a: any) => (
          <Card key={a.id}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={new Date(a.date) > new Date() ? 'default' : 'secondary'}>
                  {new Date(a.date) > new Date() ? 'Upcoming' : 'Past'}
                </Badge>
              </div>
              <CardTitle className="text-lg">{a.title}</CardTitle>
              <CardDescription>
                <p>{new Date(a.date).toLocaleDateString()}</p>
                {a.location && <p className="text-sm">{a.location}</p>}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
        {activities.length === 0 && <p className="text-muted-foreground">No activities yet.</p>}
      </div>
    </div>
  )
}
```
Expected: Activities page with API-driven card grid.

**Step 2: Commit**
```bash
git add frontend/src/app/\(public\)/activities/page.tsx
git commit -m "feat(frontend): add activities page with API fetch"
```

### Task 8.5: News page and detail

**Objective:** List published news, detail page at /news/[slug].

**Step 1: Create news list page**
```tsx
// frontend/src/app/(public)/news/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

async function fetchNews() {
  const res = await fetch('/api/public/news')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function NewsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['public-news'], queryFn: fetchNews })
  const news = data?.data || data || []

  if (isLoading) return <div className="container mx-auto px-4 py-16"><Skeleton className="h-40" /></div>

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">News</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((n: any) => (
          <Link key={n.id} href={`/news/${n.slug}`}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{n.title}</CardTitle>
                <CardDescription>
                  <p className="text-sm text-muted-foreground mb-2">{new Date(n.createdAt).toLocaleDateString()}</p>
                  <p className="line-clamp-3">{n.excerpt || n.content?.substring(0, 150)}</p>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        {news.length === 0 && <p className="text-muted-foreground">No news yet.</p>}
      </div>
    </div>
  )
}
```
Expected: News list with cards linking to detail pages.

**Step 2: Create news detail page**
```tsx
// frontend/src/app/(public)/news/[slug]/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

async function fetchNewsBySlug(slug: string) {
  const res = await fetch(`/api/public/news/${slug}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export default function NewsDetailPage() {
  const { slug } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['public-news', slug],
    queryFn: () => fetchNewsBySlug(slug as string),
  })
  const article = data?.data || data

  if (isLoading) return <div className="container mx-auto px-4 py-16"><Skeleton className="h-64" /></div>
  if (!article) return <div className="container mx-auto px-4 py-16"><p>Article not found.</p></div>

  return (
    <article className="container mx-auto px-4 py-16 max-w-3xl">
      <Button variant="outline" asChild className="mb-6"><Link href="/news">← Back to News</Link></Button>
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-sm text-muted-foreground mb-8">{new Date(article.createdAt).toLocaleDateString()}</p>
      <div className="prose max-w-none">
        {article.content?.split('\n').map((p: string, i: number) => <p key={i} className="mb-4">{p}</p>)}
      </div>
    </article>
  )
}
```
Expected: News detail page with back navigation, title, date, content.

**Step 3: Commit**
```bash
git add frontend/src/app/\(public\)/news/page.tsx frontend/src/app/\(public\)/news/\[slug\]/page.tsx
git commit -m "feat(frontend): add news list and detail pages"
```

### Task 8.6: Frequencies page

**Objective:** Searchable/filterable table of radio frequencies.

**Step 1: Create frequencies page**
```tsx
// frontend/src/app/(public)/frequencies/page.tsx
'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

async function fetchFrequencies() {
  const res = await fetch('/api/public/frequencies')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function FrequenciesPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['public-frequencies'], queryFn: fetchFrequencies })
  const freqs = data?.data || data || []

  const filtered = freqs.filter((f: any) =>
    !search || Object.values(f).some((v: any) => String(v).toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Radio Frequencies</h1>
      <Input
        placeholder="Search by band, frequency, mode, or notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md mb-6"
      />
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Band</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((f: any, i: number) => (
              <TableRow key={f.id || i}>
                <TableCell className="font-medium">{f.band}</TableCell>
                <TableCell>{f.frequency}</TableCell>
                <TableCell>{f.mode}</TableCell>
                <TableCell className="text-muted-foreground">{f.notes}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No frequencies found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```
Expected: Searchable frequencies table.

**Step 2: Commit**
```bash
git add frontend/src/app/\(public\)/frequencies/page.tsx
git commit -m "feat(frontend): add frequencies page with search"
```

### Task 8.7: Contact page

**Objective:** Contact form with name, email, subject, message inputs; org address and map embed placeholder.

**Step 1: Create contact page**
```tsx
// frontend/src/app/(public)/contact/page.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) setSubmitted(true)
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          {submitted ? (
            <p className="text-green-600 font-medium">Thank you! Your message has been sent.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <Button type="submit">Send Message</Button>
            </form>
          )}
        </div>
        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">ORARI Aceh Besar</h3>
              <p className="text-muted-foreground">Aceh Besar, Aceh, Indonesia</p>
              <hr />
              <p className="text-sm text-muted-foreground">Map embed placeholder — integrate Google Maps or Leaflet here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```
Expected: Contact form submits to API, address card with map placeholder.

**Step 2: Commit**
```bash
git add frontend/src/app/\(public\)/contact/page.tsx
git commit -m "feat(frontend): add contact page with form"
```

---

## PHASE 9: Frontend - Auth Pages

Auth pages under `frontend/src/app/(auth)/`.

### Task 9.1: Login page

**Objective:** Email/password form, calls POST /api/auth/login, stores tokens, redirects to dashboard.

**Step 1: Create login page**
```tsx
// frontend/src/app/(auth)/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error || 'Login failed')
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push(data.user.role === 'ADMIN' ? '/admin' : '/member')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Login</Button>
            <div className="text-sm text-center space-x-4">
              <Link href="/register" className="text-primary hover:underline">Register</Link>
              <Link href="/forgot-password" className="text-primary hover:underline">Forgot Password?</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```
Expected: Login form, stores token, redirects based on role.

**Step 2: Commit**
```bash
git add frontend/src/app/\(auth\)/login/page.tsx
git commit -m "feat(frontend): add login page"
```

### Task 9.2: Register page

**Objective:** Full registration form with email, password, name, callSign, phone, address.

**Step 1: Create register page**
```tsx
// frontend/src/app/(auth)/register/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', name: '', callSign: '', phone: '', address: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error || 'Registration failed')
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push('/member')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="callSign">Call Sign</Label>
                <Input id="callSign" required value={form.callSign} onChange={e => setForm({ ...form, callSign: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Register</Button>
            <p className="text-sm text-center">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```
Expected: Registration form with all fields, redirects to member dashboard on success.

**Step 2: Commit**
```bash
git add frontend/src/app/\(auth\)/register/page.tsx
git commit -m "feat(frontend): add registration page"
```

### Task 9.3: Forgot password page

**Objective:** Email input, calls POST /api/auth/forgot-password.

**Step 1: Create forgot password page**
```tsx
// frontend/src/app/(auth)/forgot-password/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.ok) setSent(true)
    else setError('Failed to send reset email')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-green-600 text-center">If that email exists, a reset link has been sent.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Send Reset Link</Button>
              <p className="text-sm text-center"><Link href="/login" className="text-primary hover:underline">Back to Login</Link></p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```
Expected: Forgot password form, calls API, shows confirmation.

**Step 2: Commit**
```bash
git add frontend/src/app/\(auth\)/forgot-password/page.tsx
git commit -m "feat(frontend): add forgot password page"
```

### Task 9.4: Reset password page

**Objective:** New password form at /reset-password/[token], calls POST /api/auth/reset-password.

**Step 1: Create reset password page**
```tsx
// frontend/src/app/(auth)/reset-password/[token]/page.tsx
'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    if (res.ok) { setDone(true); setTimeout(() => router.push('/login'), 2000) }
    else setError('Failed to reset password')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {done ? (
            <p className="text-green-600 text-center">Password reset! Redirecting to login...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Reset Password</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```
Expected: Reset password form with token from URL.

**Step 2: Commit**
```bash
git add frontend/src/app/\(auth\)/reset-password/\[token\]/page.tsx
git commit -m "feat(frontend): add reset password page"
```

---

## PHASE 10: Frontend - Member Dashboard

Protected routes under `frontend/src/app/(member)/`, requires MEMBER or ADMIN role.

### Task 10.1: Dashboard layout with sidebar

**Objective:** Layout with sidebar nav (Dashboard, Profile, Payments, Activities).

**Step 1: Create member layout with sidebar**
```tsx
// frontend/src/app/(member)/layout.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/member', label: 'Dashboard' },
  { href: '/member/profile', label: 'Profile' },
  { href: '/member/payments', label: 'Payments' },
  { href: '/member/activities', label: 'Activities' },
]

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (!token || !u) return router.push('/login')
    setUser(JSON.parse(u))
  }, [router])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col">
        <h2 className="font-bold text-lg mb-6 px-2">Member Panel</h2>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-md hover:bg-muted transition-colors',
                pathname === item.href && 'bg-primary/10 text-primary font-medium'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="outline" onClick={logout} className="mt-4">Logout</Button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
```
Expected: Protected layout with sidebar navigation.

**Step 2: Commit**
```bash
git add frontend/src/app/\(member\)/layout.tsx
git commit -m "feat(frontend): add member dashboard layout with sidebar"
```

### Task 10.2: Member dashboard home

**Objective:** Membership status card, payment history summary, upcoming activities.

**Step 1: Create member dashboard home**
```tsx
// frontend/src/app/(member)/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function MemberDashboard() {
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}
  const { data: payments } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: () => fetch('/api/transactions').then(r => r.json()),
    enabled: !!user.id,
  })
  const txns = payments?.data || payments || []

  const latestPayment = txns.find((t: any) => t.status === 'APPROVED' && t.type === 'MEMBERSHIP_FEE')
  const isActive = latestPayment && new Date(latestPayment.createdAt) > new Date(Date.now() - 365 * 86400000)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Membership Status
            <Badge variant={isActive ? 'default' : 'destructive'}>
              {isActive ? 'Active' : 'Expired'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.email}
          </p>
        </CardContent>
      </Card>
      {/* Payment History Summary */}
      <Card>
        <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
        <CardContent>
          {txns.length === 0 ? (
            <p className="text-muted-foreground">No payments yet.</p>
          ) : (
            <ul className="space-y-2">
              {txns.slice(0, 5).map((t: any) => (
                <li key={t.id} className="flex justify-between text-sm">
                  <span>{t.type} - {new Date(t.createdAt).toLocaleDateString()}</span>
                  <Badge variant={t.status === 'APPROVED' ? 'default' : t.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                    {t.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```
Expected: Dashboard with status card and payment summary.

**Step 2: Commit**
```bash
git add frontend/src/app/\(member\)/page.tsx
git commit -m "feat(frontend): add member dashboard home"
```

### Task 10.3: Profile page

**Objective:** View/edit member info (name, callSign readonly, address, phone, email).

**Step 1: Create profile page**
```tsx
// frontend/src/app/(member)/profile/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ProfilePage() {
  const [form, setForm] = useState({ name: '', email: '', callSign: '', phone: '', address: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    setForm({ name: u.name || '', email: u.email || '', callSign: u.callSign || '', phone: u.phone || '', address: u.address || '' })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('user', JSON.stringify(data.user || data))
      setSaved(true)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Call Sign</Label>
              <Input value={form.callSign} disabled className="bg-muted cursor-not-allowed" />
              <p className="text-xs text-muted-foreground mt-1">Call sign cannot be changed.</p>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            {saved && <p className="text-sm text-green-600">Profile updated!</p>}
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```
Expected: Profile page, callSign disabled, other fields editable.

**Step 2: Commit**
```bash
git add frontend/src/app/\(member\)/profile/page.tsx
git commit -m "feat(frontend): add member profile page"
```

### Task 10.4: Payment page

**Objective:** Submit payment with type, amount, receipt image upload (jpeg/png, max 5MB), notes. Calls POST /api/transactions multipart/form-data.

**Step 1: Create payment submission page**
```tsx
// frontend/src/app/(member)/payments/page.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PAYMENT_TYPES = [
  { value: 'MEMBERSHIP_FEE', label: 'Membership Fee' },
  { value: 'DONATION', label: 'Donation' },
  { value: 'EVENT_FEE', label: 'Event Fee' },
]

export default function PaymentsPage() {
  const [type, setType] = useState('')
  const [amount, setAmount] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!type) return setError('Select payment type')
    if (!amount || Number(amount) <= 0) return setError('Enter valid amount')
    if (!file) return setError('Upload receipt image')
    if (file.size > 5 * 1024 * 1024) return setError('Image too large (max 5MB)')
    if (!file.type.startsWith('image/')) return setError('Must be an image (jpeg/png)')

    setSubmitting(true)
    const fd = new FormData()
    fd.append('type', type)
    fd.append('amount', amount)
    fd.append('receiptImage', file)
    if (notes) fd.append('notes', notes)

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: fd,
    })
    setSubmitting(false)
    if (res.ok) {
      setType(''); setAmount(''); setFile(null); setNotes('')
      alert('Payment submitted! Awaiting admin approval.')
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to submit payment')
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Submit Payment</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Manual transfer only. Upload receipt image (JPEG/PNG, max 5MB). Admin will review and approve.
      </p>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Payment Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map(pt => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (IDR)</Label>
              <Input id="amount" type="number" min="1" required value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="receipt">Receipt Image</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/jpeg,image/png"
                required
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground mt-1">JPEG or PNG, max 5MB</p>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Payment'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```
Expected: Payment form with type select, amount, file upload, notes.

**Step 2: Commit**
```bash
git add frontend/src/app/\(member\)/payments/page.tsx
git commit -m "feat(frontend): add payment submission page with receipt upload"
```

### Task 10.5: Transaction history page

**Objective:** Table of past transactions with status badges (PENDING=yellow, APPROVED=green, REJECTED=red), receipt image preview.

**Step 1: Create transaction history page**
```tsx
// frontend/src/app/(member)/transactions/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const statusColors: Record<string, string> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

export default function TransactionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: () => fetch('/api/transactions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.json()),
  })
  const txns = data?.data || data || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {txns.map((t: any) => (
              <TableRow key={t.id}>
                <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell>Rp {Number(t.amount).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[t.status] as any || 'secondary'}>{t.status}</Badge>
                </TableCell>
                <TableCell>
                  {t.receiptUrl ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <Image
                          src={t.receiptUrl}
                          alt="Receipt"
                          width={800}
                          height={600}
                          className="w-full h-auto object-contain"
                        />
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {txns.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No transactions yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```
Expected: Transaction history table with status badges, receipt image preview in dialog.

**Step 2: Commit**
```bash
git add frontend/src/app/\(member\)/transactions/page.tsx
git commit -m "feat(frontend): add transaction history with receipt preview"
```

---

## PHASE 11: Frontend - Admin Dashboard

Protected routes under `frontend/src/app/(admin)/`, requires ADMIN role.

### Task 11.1: Admin layout with sidebar

**Objective:** Layout with sidebar nav (Dashboard, Members, Payments, Activities, News, Frequencies, Reports, Bulk Email).

**Step 1: Create admin layout**
```tsx
// frontend/src/app/(admin)/layout.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/activities', label: 'Activities' },
  { href: '/admin/news', label: 'News' },
  { href: '/admin/frequencies', label: 'Frequencies' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/bulk-email', label: 'Bulk Email' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (!token || !u) { router.push('/login'); return }
    const parsed = JSON.parse(u)
    if (parsed.role !== 'ADMIN') { router.push('/member'); return }
    setUser(parsed)
  }, [router])

  const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col">
        <h2 className="font-bold text-lg mb-6 px-2">Admin Panel</h2>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-md hover:bg-muted transition-colors',
                pathname === item.href && 'bg-primary/10 text-primary font-medium'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
```
Expected: Admin layout with full sidebar, admin role check.

**Step 2: Commit**
```bash
git add frontend/src/app/\(admin\)/layout.tsx
git commit -m "feat(frontend): add admin dashboard layout with sidebar"
```

### Task 11.2: Admin dashboard home

**Objective:** Stat cards and simple charts.

**Step 1: Create admin dashboard home**
```tsx
// frontend/src/app/(admin)/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.json()),
  })
  const stats = data?.data || data || {}

  if (isLoading) return <div className="grid grid-cols-4 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Members</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.totalMembers || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Members</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.activeMembers || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Payments</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.pendingPayments || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue This Month</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">Rp {Number(stats.revenueThisMonth || 0).toLocaleString()}</p></CardContent>
        </Card>
      </div>
      {/* ponytail: Add Recharts or Chart.js charts for membership growth / revenue per month when data is available */}
    </div>
  )
}
```
Expected: Admin dashboard with 4 stat cards, placeholder for charts.

**Step 2: Commit**
```bash
git add frontend/src/app/\(admin\)/page.tsx
git commit -m "feat(frontend): add admin dashboard home with stats cards"
```

### Task 11.3: Members management page

**Objective:** Table of all members with search/filter, status badges, view detail.

**Step 1: Create members management page**
```tsx
// frontend/src/app/(admin)/members/page.tsx
'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminMembersPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: () => fetch('/api/admin/members', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.json()),
  })
  const members = data?.data || data || []
  const filtered = members.filter((m: any) =>
    !search || [m.name, m.email, m.callSign, m.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Members</h1>
      <Input
        placeholder="Search by name, email, call sign, phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm mb-4"
      />
      {isLoading ? <Skeleton className="h-64" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Call Sign</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m: any) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.callSign}</TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>{m.phone}</TableCell>
                <TableCell><Badge variant={m.isActive ? 'default' : 'secondary'}>{m.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No members found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```
Expected: Members table with search/filter.

**Step 2: Commit**
```bash
git add frontend/src/app/\(admin\)/members/page.tsx
git commit -m "feat(frontend): add admin members management page"
```

### Task 11.4: Payments management page

**Objective:** All transactions table, filter by status, approve/reject buttons for PENDING, receipt thumbnail.

**Step 1: Create payments management page**
```tsx
// frontend/src/app/(admin)/payments/page.tsx
'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'

const statusColors: Record<string, string> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('ALL')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => fetch('/api/admin/transactions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.json()),
  })
  const txns = (data?.data || data || []).filter((t: any) => filter === 'ALL' || t.status === filter)

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/transactions/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-transactions'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/transactions/${id}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-transactions'] }),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payments Management</h1>
      <div className="mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <Skeleton className="h-64" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Call Sign</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {txns.map((t: any) => (
              <TableRow key={t.id}>
                <TableCell>{t.member?.name || t.memberName}</TableCell>
                <TableCell>{t.member?.callSign || t.callSign}</TableCell>
                <TableCell>Rp {Number(t.amount).toLocaleString()}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {t.receiptUrl ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View Receipt</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <Image src={t.receiptUrl} alt="Receipt" width={800} height={600} className="w-full h-auto object-contain" />
                      </DialogContent>
                    </Dialog>
                  ) : <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[t.status] as any || 'secondary'}>{t.status}</Badge>
                </TableCell>
                <TableCell>
                  {t.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approveMutation.mutate(t.id)}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate(t.id)}>Reject</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {txns.length === 0 && <TableRow><TableCell colSpan={8} className="text-center">No transactions.</TableCell></TableRow>}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```
Expected: Payments table with status filter, receipt modal, approve/reject buttons.

**Step 2: Commit**
```bash
git add frontend/src/app/\(admin\)/payments/page.tsx
git commit -m "feat(frontend): add admin payments management with approve/reject"
```

### Task 11.5: Receipt image preview modal

**Objective:** Click receipt thumbnail to see full image — already implemented in Task 11.4 using Dialog component. This task is complete as part of the payments page.

**Step 1: No additional code needed** — receipt preview is built into the payments management page via `<Dialog>` wrapping receipt thumbnails.

### Task 11.6: Activities management

**Objective:** CRUD table for activities.

**Step 1: Create activities management page**
```tsx
// frontend/src/app/(admin)/activities/page.tsx
'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function AdminActivitiesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () => fetch('/api/admin/activities', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.json()),
  })
  const activities = data?.data || data || []

  const saveMutation = useMutation({
    mutationFn: () => {
      const url = editingId ? `/api/admin/activities/${editingId}` : '/api/admin/activities'
      const method = editingId ? 'PUT' : 'POST'
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] })
      setOpen(false); setForm({ title: '', description: '', date: '', location: '' }); setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/activities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-activities'] }),
  })

  const openEdit = (a: any) => {
    setForm({ title: a.title, description: a.description || '', date: a.date?.split('T')[0] || '', location: a.location || '' })
    setEditingId(a.id)
    setOpen(true)
  }

  const openCreate = () => {
    setForm({ title: '', description: '', date: '', location: '' })
    setEditingId(null)
    setOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Button onClick={openCreate}>Add Activity</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Activity' : 'New Activity'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {isLoading ? <Skeleton className="h-64" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((a: any) => (
              <TableRow key={a.id}>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{a.location || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(a)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(a.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {activities.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No activities.</TableCell></TableRow>}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```
Expected: Activities CRUD table with create/edit dialog.

**Step 2: Commit**
```bash
git add frontend/src/app/\(admin\)/activities/page.tsx
git commit -m "feat(frontend): add admin activities CRUD page"
```

### Task 11.7: News management

**Objective:** CRUD with textarea editor, publish/unpublish toggle.

**Step 1: Create news management page**
```tsx
// frontend/src/app/(admin)/news/page.tsx
'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AdminNewsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', published: false })
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news'],
    queryFn: () => fetch('/api/admin/news', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.json()),
  })
  const news = data?.data || data || []

  const saveMutation = useMutation({
    mutationFn: () => {
      const url = editingId ? `/api/admin/news/${editingId}` : '/api/admin/news'
      const method = editingId ? 'PUT' : 'POST'
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] })
      setOpen(false); setForm({ title: '', slug: '', excerpt: '', content: '', published: false }); setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/news/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-news'] }),
  })

  const togglePublish = (item: any) => {
    fetch(`/api/admin/news/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ ...item, published: !item.published }),
    }).then(() => queryClient.invalidateQueries({ queryKey: ['admin-news'] }))
  }

  const openEdit = (n: any) => {
    setForm({ title: n.title, slug: n.slug, excerpt: n.excerpt || '', content: n.content || '', published: n.published })
    setEditingId(n.id)
    setOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">News</h1>
        <Button onClick={() => { setForm({ title: '', slug: '', excerpt: '', content: '', published: false }); setEditingId(null); setOpen(true) }}>Add Article</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Article' : 'New Article'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div><Label>Content</Label><Textarea rows={8} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            <div className="flex items-center gap-2">
              <Label>Published</Label>
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      {isLoading ? <Skeleton className="h-64" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((n: any) => (
              <TableRow key={n.id}>
                <TableCell className="font-medium">{n.title}</TableCell>
                <TableCell>{n.slug}</TableCell>
                <TableCell><Badge variant={n.published ? 'default' : 'secondary'}>{n.published ? 'Published' : 'Draft'}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(n)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => togglePublish(n)}>{n.published ? 'Unpublish' : 'Publish'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(n.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```
Expected: News CRUD table with textarea content editor, publish toggle.

**Step 2: Commit**
```bash
git add frontend/src/app/\(admin\)/news/page.tsx
git commit -m "feat(frontend): add admin news management with publish toggle"
```

### Task 11.8: Frequencies management

**Objective:** CRUD table for radio frequencies.

**Step 1: Create frequencies management page**
```tsx
// frontend/src/app/(admin)/frequencies/page.tsx
'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AdminFrequenciesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ band: '', frequency: '', mode: '', notes: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-frequencies'],
    queryFn: () => fetch('/api/admin/frequencies', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.json()),
  })
  const freqs = data?.data || data || []

  const saveMutation = useMutation({
    mutationFn: () => {
      const url = editingId ? `/api/admin/frequencies/${editingId}` : '/api/admin/frequencies'
      const method = editingId ? 'PUT' : 'POST'
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-frequencies'] })
      setOpen(false); setForm({ band: '', frequency: '', mode: '', notes: '' }); setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/frequencies/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-frequencies'] }),
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Frequencies</h1>
        <Button onClick={() => { setForm({ band: '', frequency: '', mode: '', notes: '' }); setEditingId(null); setOpen(true) }}>Add Frequency</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Frequency' : 'New Frequency'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Band</Label><Input value={form.band} onChange={e => setForm({ ...form, band: e.target.value })} /></div>
            <div><Label>Frequency</Label><Input value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} /></div>
            <div><Label>Mode</Label><Input value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      {isLoading ? <Skeleton className="h-64" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Band</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {freqs.map((f: any) => (
              <TableRow key={f.id}>
                <TableCell>{f.band}</TableCell>
                <TableCell>{f.frequency}</TableCell>
                <TableCell>{f.mode}</TableCell>
                <TableCell className="text-muted-foreground">{f.notes}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setForm({ band: f.band, frequency: f.frequency, mode: f.mode, notes: f.notes || '' }); setEditingId(f.id); setOpen(true) }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(f.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {freqs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No frequencies.</TableCell></TableRow>}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```
Expected: Frequencies CRUD table.

**Step 2: Commit**
```bash
git add frontend/src/app/\(admin\)/frequencies/page.tsx
git commit -m "feat(frontend): add admin frequencies CRUD page"
```

### Task 11.9: Reports page

**Objective:** Buttons to download Members CSV and Transactions CSV.

**Step 1: Create reports page**
```tsx
// frontend/src/app/(admin)/reports/page.tsx
'use client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function AdminReportsPage() {
  const download = (endpoint: string, filename: string) => {
    fetch(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = filename; a.click()
        window.URL.revokeObjectURL(url)
      })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Members Report</CardTitle>
            <CardDescription>Download all members as CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => download('/api/admin/reports/members', 'members.csv')}>Download CSV</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transactions Report</CardTitle>
            <CardDescription>Download all transactions as CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => download('/api/admin/reports/transactions', 'transactions.csv')}>Download CSV</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```
Expected: Reports page with CSV download buttons.

**Step 2: Commit**
```bash
git add frontend/src/app/\(admin\)/reports/page.tsx
git commit -m "feat(frontend): add admin reports page with CSV downloads"
```

### Task 11.10: Bulk email page

**Objective:** Form with subject, message body (textarea), preview, send button. Calls POST /api/admin/email/bulk.

**Step 1: Create bulk email page**
```tsx
// frontend/src/app/(admin)/bulk-email/page.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminBulkEmailPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)
    const res = await fetch('/api/admin/email/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ subject, message }),
    })
    setSending(false)
    if (res.ok) setSent(true)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Bulk Email</h1>
      {sent ? (
        <Card><CardContent className="p-6">
          <p className="text-green-600 font-medium">Email sent to all members!</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setSubject(''); setMessage('') }}>Send Another</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={10} value={message} onChange={e => setMessage(e.target.value)} />
          </div>
          {/* Preview */}
          {subject && message && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">Preview:</p>
                <p><strong>Subject:</strong> {subject}</p>
                <p className="whitespace-pre-wrap">{message}</p>
              </CardContent>
            </Card>
          )}
          <Button onClick={handleSend} disabled={sending || !subject || !message}>
            {sending ? 'Sending...' : 'Send to All Members'}
          </Button>
        </div>
      )}
    </div>
  )
}
```
Expected: Bulk email form with preview, sends to all members.

**Step 2: Commit**
```bash
git add frontend/src/app/\(admin\)/bulk-email/page.tsx
git commit -m "feat(frontend): add admin bulk email page"
```

---

## PHASE 12: Docker Setup

### Task 12.1: Backend Dockerfile

**Objective:** Create Dockerfile for Node.js Express backend.

**Step 1: Create backend Dockerfile**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "dist/index.js"]
```
Expected: Multi-stage backend Dockerfile.

**Step 2: Commit**
```bash
git add backend/Dockerfile
git commit -m "feat(docker): add backend Dockerfile"
```

### Task 12.2: Frontend Dockerfile

**Objective:** Create Dockerfile for Next.js frontend.

**Step 1: Create frontend Dockerfile**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.mjs ./
EXPOSE 3000
CMD ["npm", "start"]
```
Expected: Multi-stage frontend Dockerfile.

**Step 2: Commit**
```bash
git add frontend/Dockerfile
git commit -m "feat(docker): add frontend Dockerfile"
```

### Task 12.3: Nginx config

**Objective:** Reverse proxy configuration.

**Step 1: Create Nginx config**
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name _;
        client_max_body_size 10M;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Uploaded files (receipt images)
        location /uploads/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
        }
    }
}
```
Expected: Nginx reverse proxy routing / -> frontend, /api -> backend, /uploads -> backend.

**Step 2: Commit**
```bash
git add nginx/nginx.conf
git commit -m "feat(docker): add nginx reverse proxy config"
```

### Task 12.4: docker-compose.yml

**Objective:** Main docker-compose with all services.

**Step 1: Create docker-compose.yml**
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER:-orari}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-orari123}
      POSTGRES_DB: ${DB_NAME:-orari_aceh_besar}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build:
      context: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER:-orari}:${DB_PASSWORD:-orari123}@postgres:5432/${DB_NAME:-orari_aceh_besar}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
      UPLOAD_DIR: /app/uploads
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:3000}
    volumes:
      - uploads:/app/uploads
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
    environment:
      NODE_ENV: production
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  uploads:
```
Expected: docker-compose with postgres, backend, frontend, nginx services.

**Step 2: Commit**
```bash
git add docker-compose.yml
git commit -m "feat(docker): add docker-compose.yml with all services"
```

### Task 12.5: docker-compose.dev.yml

**Objective:** Development override with hot reload.

**Step 1: Create docker-compose.dev.yml**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend/src:/app/src
      - ./backend/prisma:/app/prisma
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend/src:/app/src
    command: npm run dev
    ports:
      - "3000:3000"
```
Expected: Dev override with volume mounts for hot reload.

**Step 2: Commit**
```bash
git add docker-compose.dev.yml
git commit -m "feat(docker): add docker-compose.dev.yml for development"
```

### Task 12.6: .env.production.example

**Objective:** Production environment variables reference.

**Step 1: Create .env.production.example**
```bash
# .env.production.example
# Database
DB_USER=orari
DB_PASSWORD=change_me_strong_password
DB_NAME=orari_aceh_besar

# JWT
JWT_SECRET=change_me_jwt_secret_at_least_32_chars
JWT_EXPIRES_IN=7d

# SMTP (for email notifications and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL (for email links)
FRONTEND_URL=https://orari.example.com
```
Expected: Production env var reference file.

**Step 2: Commit**
```bash
git add .env.production.example
git commit -m "feat(docker): add .env.production.example"
```

---

## PHASE 13: Testing & Deployment Documentation

### Task 13.1: Create seed script

**Objective:** Seed script creating admin user, sample members, activities, news, frequencies.

**Step 1: Create Prisma seed script**
```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@orari-acehbesar.or.id' },
    update: {},
    create: {
      email: 'admin@orari-acehbesar.or.id',
      password: hashedPassword,
      name: 'Admin ORARI',
      callSign: 'YB1AAA',
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log('Admin created:', admin.email)

  // Sample members
  const members = [
    { email: 'member1@test.com', name: 'Ahmad Fauzi', callSign: 'YB1BBB', phone: '081234567891', address: 'Banda Aceh' },
    { email: 'member2@test.com', name: 'Budi Santoso', callSign: 'YB1CCC', phone: '081234567892', address: 'Aceh Besar' },
    { email: 'member3@test.com', name: 'Cut Nyak Dian', callSign: 'YB1DDD', phone: '081234567893', address: 'Jantho' },
    { email: 'member4@test.com', name: 'Dedi Irawan', callSign: 'YB1EEE', phone: '081234567894', address: 'Lhoknga' },
    { email: 'member5@test.com', name: 'Eva Rahmi', callSign: 'YB1FFF', phone: '081234567895', address: 'Lamno' },
  ]
  for (const m of members) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: { ...m, password: hashedPassword, role: 'MEMBER', isActive: true },
    })
  }
  console.log(`${members.length} sample members created`)

  // Sample activities
  const activities = [
    { title: 'Networking Night', description: 'Monthly ham radio networking event.', date: new Date('2026-08-15'), location: 'Banda Aceh' },
    { title: 'Field Day Exercise', description: 'Annual field day emergency comms exercise.', date: new Date('2026-09-10'), location: 'Lhoknga Beach' },
    { title: 'Tech Workshop', description: 'Antenna building and propagation workshop.', date: new Date('2026-10-05'), location: 'Jantho' },
  ]
  for (const a of activities) {
    await prisma.activity.create({ data: a })
  }
  console.log(`${activities.length} activities created`)

  // Sample news
  const news = [
    { title: 'Welcome to ORARI Aceh Besar', slug: 'welcome', excerpt: 'We are excited to launch our new website.', content: 'ORARI Aceh Besar now has a modern membership management system. Members can register online, submit payments, and track their membership status.', published: true },
    { title: 'Field Day 2026 Announced', slug: 'field-day-2026', excerpt: 'Annual field day exercise scheduled for September.', content: 'Join us for our annual field day exercise at Lhoknga Beach. All members are encouraged to participate.', published: true },
    { title: 'New Repeater Installation', slug: 'new-repeater', excerpt: 'New repeater installed on Mount Seulawah.', content: 'We have installed a new VHF repeater on Mount Seulawah, expanding coverage across Aceh Besar.', published: false },
  ]
  for (const n of news) {
    await prisma.news.create({ data: n })
  }
  console.log(`${news.length} news articles created`)

  // Sample frequencies
  const frequencies = [
    { band: 'HF 80m', frequency: '3.850 MHz', mode: 'LSB', notes: 'Nighttime net' },
    { band: 'HF 40m', frequency: '7.090 MHz', mode: 'LSB', notes: 'Daytime net' },
    { band: 'VHF 2m', frequency: '144.620 MHz', mode: 'FM', notes: 'Repeater input' },
    { band: 'VHF 2m', frequency: '145.220 MHz', mode: 'FM', notes: 'Repeater output (Tone 88.5)' },
    { band: 'UHF 70cm', frequency: '438.500 MHz', mode: 'FM', notes: 'Simplex' },
  ]
  for (const f of frequencies) {
    await prisma.frequency.create({ data: f })
  }
  console.log(`${frequencies.length} frequencies created`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```
Expected: Seed script creating sample data for all entities.

**Step 2: Commit**
```bash
git add backend/prisma/seed.ts
git commit -m "feat(seed): add database seed script with sample data"
```

### Task 13.2: API documentation

**Objective:** List all API endpoints with method, path, auth, request/response.

**Step 1: Create API docs**
```markdown
# docs/API.md

## API Endpoints

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register new member |
| POST | /api/auth/login | No | Login, returns JWT |
| POST | /api/auth/forgot-password | No | Send password reset email |
| POST | /api/auth/reset-password | No | Reset password with token |
| PUT | /api/auth/profile | Yes | Update own profile |

### Public
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/activities | No | List published activities |
| GET | /api/public/news | No | List published news |
| GET | /api/public/news/:slug | No | Get news by slug |
| GET | /api/public/frequencies | No | List all frequencies |
| POST | /api/public/contact | No | Submit contact form |

### Member Transactions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/transactions | Yes (MEMBER/ADMIN) | List own transactions |
| POST | /api/transactions | Yes (MEMBER/ADMIN) | Submit payment with receipt image |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/admin/stats | Admin | Dashboard statistics |
| GET | /api/admin/members | Admin | List all members |
| GET | /api/admin/transactions | Admin | List all transactions |
| PATCH | /api/admin/transactions/:id/approve | Admin | Approve transaction |
| PATCH | /api/admin/transactions/:id/reject | Admin | Reject transaction |
| GET/POST | /api/admin/activities | Admin | List/Create activities |
| PUT/DELETE | /api/admin/activities/:id | Admin | Update/Delete activity |
| GET/POST | /api/admin/news | Admin | List/Create news |
| PUT/DELETE | /api/admin/news/:id | Admin | Update/Delete news |
| GET/POST | /api/admin/frequencies | Admin | List/Create frequencies |
| PUT/DELETE | /api/admin/frequencies/:id | Admin | Update/Delete frequency |
| GET | /api/admin/reports/members | Admin | Download members CSV |
| GET | /api/admin/reports/transactions | Admin | Download transactions CSV |
| POST | /api/admin/email/bulk | Admin | Send bulk email to members |
```
Expected: Complete API endpoint reference.

**Step 2: Commit**
```bash
git add docs/API.md
git commit -m "docs: add API documentation"
```

### Task 13.3: Database documentation

**Objective:** ER diagram and table descriptions.

**Step 1: Create database docs**
```markdown
# docs/DATABASE.md

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐
│    User      │       │   Transaction    │
│──────────────│       │──────────────────│
│ id (PK)      │──┐    │ id (PK)          │
│ email        │  │    │ userId (FK)      │──┐
│ password     │  │    │ type             │  │
│ name         │  └────│ amount           │  │
│ callSign     │       │ receiptUrl       │  │
│ phone        │       │ status           │  │
│ address      │       │ notes            │  │
│ role         │       │ createdAt        │  │
│ isActive     │       └──────────────────┘  │
│ createdAt    │                             │
└──────────────┘                             │
                                             │
┌──────────────┐       ┌──────────────────┐  │
│   Activity   │       │      News        │  │
│──────────────│       │──────────────────│  │
│ id (PK)      │       │ id (PK)          │  │
│ title        │       │ title            │  │
│ description  │       │ slug (unique)    │  │
│ date         │       │ excerpt          │  │
│ location     │       │ content          │  │
│ createdAt    │       │ published        │  │
└──────────────┘       │ createdAt        │  │
                       └──────────────────┘  │
                                             │
┌──────────────────┐    ┌──────────────────┐ │
│   Frequency      │    │ PasswordReset    │ │
│──────────────────│    │──────────────────│ │
│ id (PK)          │    │ id (PK)          │ │
│ band             │    │ email            │ │
│ frequency        │    │ token (unique)   │ │
│ mode             │    │ expiresAt        │ │
│ notes            │    │ used             │ │
│ createdAt        │    └──────────────────┘ │
└──────────────────┘                         │
                                             │
┌──────────────────┐                         │
│  ContactMessage  │                         │
│──────────────────│                         │
│ id (PK)          │                         │
│ name             │                         │
│ email            │                         │
│ subject          │                         │
│ message          │                         │
│ createdAt        │                         │
└──────────────────┘                         │
```

## Tables

- **User** — Members and admins. `role` is `MEMBER` or `ADMIN`. `isActive` tracks membership status.
- **Transaction** — Payment records. `type`: `MEMBERSHIP_FEE`, `DONATION`, `EVENT_FEE`. `status`: `PENDING`, `APPROVED`, `REJECTED`. `receiptUrl` stores uploaded receipt image path.
- **Activity** — Events/activities with date and location.
- **News** — Articles with slug-based URLs, publish toggle.
- **Frequency** — Radio frequency directory.
- **PasswordReset** — Password reset tokens.
- **ContactMessage** — Contact form submissions.
```
Expected: Database schema documentation.

**Step 2: Commit**
```bash
git add docs/DATABASE.md
git commit -m "docs: add database schema documentation"
```

### Task 13.4: Deployment documentation

**Objective:** Step-by-step VPS deployment guide.

**Step 1: Create deployment docs**
```markdown
# docs/DEPLOYMENT.md

## Prerequisites
- Ubuntu 22.04+ VPS
- Docker & Docker Compose installed
- Domain name pointing to server IP

## Step 1: Install Docker
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

## Step 2: Clone Repository
```bash
git clone https://github.com/your-org/orari-aceh-besar.git
cd orari-aceh-besar
```

## Step 3: Configure Environment
```bash
cp .env.production.example .env.production
nano .env.production
# Set:
# - DB_PASSWORD (strong password)
# - JWT_SECRET (random 32+ chars)
# - SMTP credentials
# - FRONTEND_URL (https://your-domain.com)
```

## Step 4: Start Services
```bash
docker compose --env-file .env.production up -d
```

## Step 5: Run Database Migrations
```bash
docker compose exec backend npx prisma migrate deploy
```

## Step 6: Seed Database
```bash
docker compose exec backend npx prisma db seed
```

## Step 7: Verify
```bash
curl http://localhost/api/public/activities
# Should return JSON with activities
```

## Updating
```bash
git pull
docker compose --env-file .env.production up -d --build
docker compose exec backend npx prisma migrate deploy
```
Expected: Deployment guide with Docker-based steps.

**Step 2: Commit**
```bash
git add docs/DEPLOYMENT.md
git commit -m "docs: add deployment guide"
```

### Task 13.5: Final README.md

**Objective:** Comprehensive README with project overview, tech stack, setup, and links.

**Step 1: Update README with complete project documentation**
```markdown
# ORARI Aceh Besar Web Application

Full-stack membership management system for ORARI Aceh Besar (Organisasi Amatir Radio Indonesia Daerah Aceh Besar).

## Features
- **Public Pages** — Landing, About, Activities, News, Frequencies, Contact
- **Member Registration** — Self-registration with call sign, email, password
- **Payment System** — Manual transfer with receipt image upload (JPEG/PNG, max 5MB)
- **Member Dashboard** — Status tracking, payment history, profile management
- **Admin Dashboard** — Member management, payment approval/rejection, CRUD operations
- **Reports** — CSV downloads for members and transactions
- **Bulk Email** — Send announcements to all members

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui, TanStack Query, React Hook Form + Zod
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** SQLite (dev) / PostgreSQL (production)
- **Auth:** JWT with bcrypt password hashing
- **File Storage:** Local filesystem (uploads/)
- **Deployment:** Docker, Docker Compose, Nginx

## Project Structure
```
orari-aceh-besar/
├── backend/           # Express REST API
│   ├── prisma/        # Schema, migrations, seed
│   └── src/           # Routes, middleware, services
├── frontend/          # Next.js 14 app
│   └── src/app/       # App Router pages
│       ├── (public)/  # Public pages
│       ├── (auth)/    # Login/Register
│       ├── (member)/  # Member dashboard
│       └── (admin)/   # Admin dashboard
├── docs/              # Documentation
├── nginx/             # Reverse proxy config
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Quick Start (Development)
```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Quick Start (Docker)
```bash
cp .env.production.example .env.production
# Edit .env.production with your values
docker compose --env-file .env.production up -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

## Documentation
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
```
Expected: Comprehensive README with all sections.

**Step 2: Commit**
```bash
git add README.md
git commit -m "docs: update README with complete project documentation"
```
