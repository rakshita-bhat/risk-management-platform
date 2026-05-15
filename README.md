# Safety Compliance & Risk Management Platform

A comprehensive web application for managing safety audits, risks, corrective actions, and compliance across organizations with hierarchical location structures.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | NestJS, TypeORM, MySQL, JWT, Passport.js |
| APIs | REST API with Swagger/OpenAPI documentation |
| Authentication | JWT with Role-Based Access Control (RBAC) |

## Prerequisites

- **Node.js** (v18 or higher)
- **MySQL Server** (v8.0+)
- **npm** or **yarn**
- **Git** for version control

---

## Setup Instructions

### 1. Database Setup

```sql
-- Create the database
CREATE DATABASE safety_compliance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your MySQL credentials
```

**Environment Variables (`.env`):**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=safety_compliance_db

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=3600

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Start Backend:**
```bash
npm run start:dev
```

- API Server: `http://localhost:3000`
- Swagger Documentation: `http://localhost:3000/api`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd safety-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

- Frontend: `http://localhost:5173`

### 4. Default Credentials

After registration, you can create users through the frontend or API:

```bash
# Register via API
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

---

## Architecture Decisions

### 1. Backend Architecture (NestJS)

#### Module-Based Structure
```
backend/src/
├── auth/           # Authentication & JWT
├── user/           # User management
├── location/       # Hierarchical locations
├── risk/           # Risk management
├── audit/          # Audit management
├── dashboard/      # Analytics & statistics
└── reports/        # Report generation
```

**Design Principles:**
- **Separation of Concerns**: Each module has distinct responsibility
- **Dependency Injection**: NestJS IoC container for loose coupling
- **TypeORM**: Database abstraction with repository pattern

#### Authentication Flow
```
User Login → Validate Credentials → Generate JWT → Return Token
Protected Request → Verify JWT → Extract User → Authorize
```

#### Role-Based Access Control (RBAC)
- **Admin**: Full system access
- **Manager**: Manage team resources
- **Auditor**: Conduct audits
- **User**: View assigned items

### 2. Frontend Architecture (React)

#### Component Structure
```
safety-frontend/src/
├── pages/          # Page components
├── layouts/        # Layout components
├── services/       # API services
├── context/        # React context
└── utils/          # Utilities
```

**Design Principles:**
- **Single Page Application**: React Router for navigation
- **Centralized State**: Auth context for user state
- **Service Layer**: API abstraction for clean components

#### State Management
- **Auth Context**: User authentication state
- **Local State**: Component-specific state with useState
- **Server State**: API calls with axios

---

## Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment ID |
| email | VARCHAR(255) | Unique email |
| password | VARCHAR(255) | Bcrypt hashed |
| firstName | VARCHAR(100) | First name |
| lastName | VARCHAR(100) | Last name |
| role | ENUM | admin, manager, auditor, user |
| createdAt | DATETIME | Creation timestamp |
| updatedAt | DATETIME | Last update timestamp |

### Locations Table (Self-referencing)
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment ID |
| name | VARCHAR(255) | Location name |
| description | TEXT | Optional description |
| parentId | INT (FK) | Parent location (nullable) |

### Risks Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment ID |
| title | VARCHAR(255) | Risk title |
| description | TEXT | Risk description |
| status | ENUM | Open, In Progress, Closed |
| locationId | INT (FK) | Associated location |
| assigneeId | INT (FK) | Assigned user |
| creatorId | INT (FK) | Created by user |
| createdAt | DATETIME | Creation timestamp |

### Audits Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment ID |
| title | VARCHAR(255) | Audit title |
| description | TEXT | Audit description |
| status | ENUM | Pending, In Progress, Completed |
| auditorId | INT (FK) | Assigned auditor |
| locationId | INT (FK) | Audit location |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| GET | /auth/profile | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users | List all users |
| POST | /users | Create new user |
| GET | /users/:id | Get user by ID |
| PUT | /users/:id | Update user |
| DELETE | /users/:id | Delete user |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /locations | List all locations |
| GET | /locations/tree | Get hierarchical tree |
| POST | /locations | Create location |
| PUT | /locations/:id | Update location |
| DELETE | /locations/:id | Delete location |

### Risks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /risks | List risks (with filters) |
| POST | /risks | Create risk |
| GET | /risks/:id | Get risk details |
| PUT | /risks/:id | Update risk |
| PUT | /risks/:id/status | Update status |
| DELETE | /risks/:id | Delete risk |

### Audits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /audits | List audits |
| POST | /audits | Create audit |
| GET | /audits/:id | Get audit details |
| PUT | /audits/:id | Update audit |
| DELETE | /audits/:id | Delete audit |

### Dashboard & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard | Dashboard statistics |
| GET | /reports/risks | Risk report data |
| GET | /reports/audits | Audit report data |
| GET | /reports/risks/pdf | Export risk PDF |
| GET | /reports/audits/pdf | Export audit PDF |

---

## Extensibility Approach

### 1. Adding New Modules

**Backend:**
```bash
# NestJS CLI to generate module
nest g module new-module
nest g controller new-module
nest g service new-module
```

**Steps:**
1. Create entity in `src/new-module/entities/`
2. Create service in `src/new-module/`
3. Create controller in `src/new-module/`
4. Register in `app.module.ts`

### 2. Adding New Roles

**Backend:**
1. Update UserRole enum in `user/entities/user.entity.ts`
2. Add role checks in controllers

**Frontend:**
1. Add role to role options in forms
2. Update route guards for role-based access

### 3. Adding New Fields

**Example: Adding priority to Risks**

**Backend:**
1. Update Risk entity - add `priority` column
2. Update DTOs in controller
3. Run migration (if using migrations)

**Frontend:**
1. Add field to form component
2. Update table display
3. Add filter option

### 4. Adding File Uploads

The system supports Cloudinary integration:
```typescript
// Install cloudinary
npm install @cloudinary/url-gen @cloudinary/react

// Add upload endpoint
@Post('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(FileInterceptor('file'))
upload(@UploadedFile() file: Express.Multer.File) {
  // Upload to Cloudinary
  // Return URL
}
```

### 5. Adding Email Notifications

```bash
# Install nodemailer
npm install nodemailer @types/nodemailer
```

Create notification service:
```typescript
@Injectable()
export class NotificationService {
  async sendEmail(to: string, subject: string, body: string) {
    // Configure with SMTP provider
  }
}
```

### 6. Custom Workflows

Risk status workflow is extensible:
```typescript
// Add custom statuses
const workflow = ['Open', 'In Progress', 'Under Review', 'Closed'];

// Add approval steps
@Put(':id/approve')
async approve(@Param('id') id: number, @Body() data: { approverId: number }) {
  // Add approval logic
}
```

---

## Features

### Current Features
- ✅ User Registration & Login (JWT)
- ✅ Role-Based Access Control
- ✅ Risk Management (CRUD, Workflow)
- ✅ Location Management (Hierarchical)
- ✅ Audit Management
- ✅ Dashboard Analytics
- ✅ PDF Report Generation
- ✅ CSV Export
- ✅ Swagger API Documentation
- ✅ Dark Mode Support

### Planned Features
- 📋 Activity Logs
- 📋 Document Management
- 📋 Email Notifications
- 📋 Slack/Teams Integration
- 📋 Mobile App
- 📋 Audit Checklists
- 📋 Corrective Actions (CAPA)

---

## Project Structure

```
safety-platform/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/          # Authentication
│   │   ├── user/          # User management
│   │   ├── location/      # Location hierarchy
│   │   ├── risk/          # Risk management
│   │   ├── audit/         # Audit management
│   │   ├── dashboard/     # Analytics
│   │   └── reports/       # Report generation
│   └── .env              # Environment config
│
├── safety-frontend/       # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── layouts/      # Layout components
│   │   ├── services/     # API services
│   │   ├── context/      # React context
│   │   └── utils/        # Utilities
│   └── package.json
│
└── README.md             # This file
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Verify MySQL is running
mysql -u root -p

# Check credentials in .env
```

**2. Port Already in Use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

**3. JWT Token Issues**
```bash
# Clear localStorage in browser
# Re-login to get fresh token
```

---

## License

MIT License - Feel free to use for learning or commercial purposes.