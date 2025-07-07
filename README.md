# Money Tracker API

REST API for the Money Tracker App.

## 🚀 Features

- User authentication (login/register)
- User management (CRUD operations)

## 🛠️ Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: validator.js
- **Security**: helmet, cors, express-rate-limit
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint
- **Development**: nodemon
- **Deployment**: Docker, Fly.io

## 📦 Installation

### Prerequisites

- Node.js (>=18.0.0)
- npm

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Version Control
COMMIT_HASH=development
```

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd money-tracker-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

**Base URL**
- `http://localhost:3000/`
- `http://localhost:3000/api/v1`

**Authentication**
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

**Users**
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 🧪 Testing

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

## 🔒 Security

- JWT authentication
- Password hashing (bcryptjs)
- CORS, Helmet, Rate limiting
- Input sanitization and validation
- User ownership validation

## 📁 Project Structure

```
money-tracker-api/
├── app.js               # Express app configuration
├── server.js            # Server startup
├── package.json         # Dependencies and scripts
├── Dockerfile           # Docker configuration
├── fly.toml             # Fly.io deployment config
├── controllers/         # Route handlers
├── middleware/          # Custom middleware
├── models/              # Data models
├── routes/              # API routes
├── store/               # Data storage
├── tests/               # Test files
│   ├── unit/
│   └── integration/
└── utils/               # Utility functions
```

## 🔧 Development

```bash
npm run dev     # Start development server
npm start       # Start production server
npm run lint    # Run ESLint
npm test        # Run tests
```

## 🚢 Deployment

**Docker**
```bash
docker build -t money-tracker-api .
docker run -p 3000:3000 -e NODE_ENV=production money-tracker-api
```

**Fly.io**
```bash
fly deploy
```
