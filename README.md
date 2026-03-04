# CollabNotes - Collaborative Note-Taking Web Application

A feature-rich, real-time collaborative note-taking application built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## 🚀 Features

### Core Features

- **JWT Authentication** - Secure user registration and login with refresh token support
- **Rich Text Editor** - TipTap-powered editor with formatting capabilities
- **Real-time Collaboration** - Multiple users can edit notes simultaneously using WebSocket (Socket.io)
- **Full-text Search** - MongoDB text indexing for fast note searching
- **Collaborator Management** - Add collaborators with granular permissions (read, write, admin)
- **Note Organization** - Pin, archive, and tag your notes for easy organization
- **Responsive Design** - Beautiful, mobile-friendly UI built with Tailwind CSS

### Technical Highlights

- **TypeScript** - Full type safety across frontend and backend
- **Industry Best Practices** - Clean architecture, error handling, input validation
- **Security** - Helmet, CORS, rate limiting, bcrypt password hashing
- **Real-time Updates** - Socket.io for live collaboration
- **RESTful API** - Well-structured API endpoints with proper HTTP methods
- **MongoDB Indexes** - Optimized queries with compound and text indexes

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Note-Taking web app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Variables

#### Backend (.env)

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/notesapp

# For MongoDB Atlas (recommended for production):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notesapp

# JWT Secrets (IMPORTANT: Generate strong secrets for production)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**⚠️ Security Note:** For production, generate strong random secrets:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

#### Frontend (.env)

Create a `.env` file in the `client` directory:

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:

   ```bash
   # Windows
   net start MongoDB

   # Mac
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Recommended)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update `MONGODB_URI` in `server/.env`

### 5. Start the Application

#### Development Mode (Both servers)

From the root directory:

```bash
npm run dev
```

This will start:

- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

#### Or start individually:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

### 6. Build for Production

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
Note-Taking web app/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── CollaboratorModal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/       # React Context providers
│   │   │   └── AuthContext.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── NoteEditor.tsx
│   │   │   └── Register.tsx
│   │   ├── services/       # API service layers
│   │   │   ├── authService.ts
│   │   │   ├── noteService.ts
│   │   │   └── socketService.ts
│   │   ├── types/          # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/          # Utility functions
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── index.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── database.ts
│   │   │   └── index.ts
│   │   ├── controllers/    # Route controllers
│   │   │   ├── authController.ts
│   │   │   └── noteController.ts
│   │   ├── middleware/     # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── models/         # Mongoose models
│   │   │   ├── Note.ts
│   │   │   ├── RefreshToken.ts
│   │   │   └── User.ts
│   │   ├── routes/         # API routes
│   │   │   ├── authRoutes.ts
│   │   │   └── noteRoutes.ts
│   │   ├── socket/         # Socket.io configuration
│   │   │   └── index.ts
│   │   ├── utils/          # Utility functions
│   │   │   └── jwt.ts
│   │   └── server.ts       # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint               | Description             | Auth Required |
| ------ | ---------------------- | ----------------------- | ------------- |
| POST   | `/api/auth/register`   | Register new user       | No            |
| POST   | `/api/auth/login`      | Login user              | No            |
| POST   | `/api/auth/refresh`    | Refresh access token    | No            |
| POST   | `/api/auth/logout`     | Logout user             | No            |
| POST   | `/api/auth/logout-all` | Logout from all devices | Yes           |

### Notes

| Method | Endpoint            | Description        | Auth Required |
| ------ | ------------------- | ------------------ | ------------- |
| POST   | `/api/notes`        | Create new note    | Yes           |
| GET    | `/api/notes`        | Get all user notes | Yes           |
| GET    | `/api/notes/search` | Search notes       | Yes           |
| GET    | `/api/notes/:id`    | Get specific note  | Yes           |
| PATCH  | `/api/notes/:id`    | Update note        | Yes           |
| DELETE | `/api/notes/:id`    | Delete note        | Yes           |

### Collaborators

| Method | Endpoint                                       | Description         | Auth Required |
| ------ | ---------------------------------------------- | ------------------- | ------------- |
| POST   | `/api/notes/:id/collaborators`                 | Add collaborator    | Yes           |
| DELETE | `/api/notes/:id/collaborators/:collaboratorId` | Remove collaborator | Yes           |
| PATCH  | `/api/notes/:id/collaborators/:collaboratorId` | Update permissions  | Yes           |

## 🔐 Environment Variables

### Backend Environment Variables

| Variable                | Description               | Default               | Required |
| ----------------------- | ------------------------- | --------------------- | -------- |
| NODE_ENV                | Environment mode          | development           | No       |
| PORT                    | Server port               | 5000                  | No       |
| CLIENT_URL              | Frontend URL              | http://localhost:3000 | Yes      |
| MONGODB_URI             | MongoDB connection string | -                     | Yes      |
| JWT_ACCESS_SECRET       | Secret for access tokens  | -                     | Yes      |
| JWT_REFRESH_SECRET      | Secret for refresh tokens | -                     | Yes      |
| JWT_ACCESS_EXPIRE       | Access token expiry       | 15m                   | No       |
| JWT_REFRESH_EXPIRE      | Refresh token expiry      | 7d                    | No       |
| BCRYPT_ROUNDS           | Bcrypt hashing rounds     | 10                    | No       |
| RATE_LIMIT_WINDOW_MS    | Rate limit window         | 900000                | No       |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window   | 100                   | No       |

### Frontend Environment Variables

| Variable             | Description          | Default | Required |
| -------------------- | -------------------- | ------- | -------- |
| REACT_APP_API_URL    | Backend API URL      | -       | Yes      |
| REACT_APP_SOCKET_URL | WebSocket server URL | -       | Yes      |

## 🎯 Usage Guide

### 1. Register an Account

- Navigate to `http://localhost:3000/register`
- Fill in your details
- Click "Sign Up"

### 2. Create a Note

- After logging in, click "+ New Note"
- Enter a title and start writing

### 3. Add Collaborators

- Open a note
- Click "👥 Manage Collaborators"
- Enter collaborator's email and select permission level
- Permissions:
  - **Read**: Can view the note
  - **Write**: Can view and edit the note
  - **Admin**: Can view, edit, and manage collaborators

### 4. Real-time Collaboration

- Share a note with collaborators
- Multiple users can edit simultaneously
- See active users indicator
- Changes sync in real-time

### 5. Search Notes

- Use the search bar on the dashboard
- Search by title, content, or tags

### 6. Organize Notes

- **Pin** important notes (📌 icon)
- **Archive** old notes (📁 icon)
- Add **tags** for better organization

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration
- [ ] User login/logout
- [ ] Create, read, update, delete notes
- [ ] Add/remove collaborators
- [ ] Real-time collaboration (open same note in multiple tabs/browsers)
- [ ] Search functionality
- [ ] Pin/unpin notes
- [ ] Archive/unarchive notes
- [ ] Tag management
- [ ] Permission levels (read/write/admin)

## 🚀 Deployment

### Deploying Backend

#### Option 1: Heroku

```bash
cd server
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
# Set all other environment variables
git push heroku main
```

#### Option 2: Railway

1. Connect your GitHub repository
2. Select the `/server` directory
3. Add environment variables in Railway dashboard
4. Deploy

### Deploying Frontend

#### Option 1: Vercel

```bash
cd client
vercel
```

#### Option 2: Netlify

```bash
cd client
npm run build
netlify deploy --prod
```

Update `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` to your deployed backend URL.

## 🛡️ Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Authentication**: Access and refresh token strategy
- **Token Rotation**: Refresh tokens are rotated on use
- **Helmet**: Security headers
- **CORS**: Configured for your frontend domain
- **Rate Limiting**: Prevents abuse
- **Input Validation**: express-validator on all endpoints
- **NoSQL Injection Prevention**: Mongoose sanitization
- **XSS Protection**: React's built-in protection

## 🎨 Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **TipTap** - Rich text editor
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Routing

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- TipTap for the excellent rich text editor
- MongoDB for the powerful database
- The MERN stack community

## 📞 Support

For issues and questions:

1. Check existing GitHub Issues
2. Create a new issue with detailed description
3. Contact: your.email@example.com

---

**Made with ❤️ using the MERN Stack**
