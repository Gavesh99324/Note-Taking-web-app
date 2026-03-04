# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-04

### Added

- **Authentication System**
  - User registration with email validation
  - Secure login with JWT tokens
  - Refresh token rotation
  - Logout and logout-all functionality
  - Password hashing with bcrypt

- **Note Management**
  - Create, read, update, delete (CRUD) operations
  - Rich text editor powered by TipTap
  - Auto-save functionality
  - Pin/unpin notes
  - Archive/unarchive notes
  - Tag system for organization

- **Real-time Collaboration**
  - WebSocket integration with Socket.io
  - Multiple users can edit simultaneously
  - Active users indicator
  - Real-time content synchronization
  - Cursor position tracking

- **Collaborator Management**
  - Add collaborators by email
  - Three permission levels: Read, Write, Admin
  - Update collaborator permissions
  - Remove collaborators
  - Access control enforcement

- **Search & Filtering**
  - Full-text search using MongoDB text indexes
  - Search by title, content, and tags
  - Filter by pinned status
  - Filter by archived status
  - Tag-based filtering

- **User Interface**
  - Responsive design with Tailwind CSS
  - Clean, modern dashboard
  - Protected routes
  - Loading states
  - Error handling and user feedback
  - Modal dialogs

- **Security Features**
  - Helmet for security headers
  - CORS configuration
  - Rate limiting
  - Input validation with express-validator
  - XSS protection
  - NoSQL injection prevention

- **Developer Experience**
  - Full TypeScript support
  - ESLint configuration
  - Comprehensive documentation
  - Environment variable templates
  - Development and production configs

### Technical Details

- **Backend**: Node.js, Express, TypeScript, MongoDB, Socket.io
- **Frontend**: React, TypeScript, Tailwind CSS, TipTap
- **Database**: MongoDB with optimized indexes
- **Authentication**: JWT with access and refresh tokens
- **Real-time**: Socket.io for WebSocket connections

### Documentation

- Comprehensive README with setup instructions
- API endpoint documentation
- Environment variable documentation
- Deployment guide for multiple platforms
- Contributing guidelines
- Demo video script

---

## Future Roadmap

### [1.1.0] - Planned

- [ ] File attachments support
- [ ] Export notes as PDF/Markdown
- [ ] Note templates
- [ ] Note history/versioning
- [ ] Dark mode
- [ ] Mobile app (React Native)

### [1.2.0] - Planned

- [ ] Markdown support
- [ ] Drawing/sketching tools
- [ ] Voice notes
- [ ] Offline mode with sync
- [ ] Public note sharing
- [ ] Custom themes

### [2.0.0] - Planned

- [ ] Workspaces/Organizations
- [ ] Advanced permissions system
- [ ] Comment threads
- [ ] Notification system
- [ ] Email notifications
- [ ] Activity log
- [ ] Analytics dashboard
