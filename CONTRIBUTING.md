# Contributing to CollabNotes

Thank you for considering contributing to CollabNotes! This document provides guidelines for contributing to the project.

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

### Suggesting Features

Feature requests are welcome! Please:

- Check if the feature has already been requested
- Provide clear use cases
- Explain why it would be valuable

### Pull Requests

1. **Fork the repository**
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**: `git commit -m "Add: feature description"`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Create a Pull Request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/collaborative-notes-app.git
cd collaborative-notes-app

# Install dependencies
npm run install-all

# Create environment files
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start development
npm run dev
```

### Coding Standards

- **TypeScript**: Use proper typing, avoid `any`
- **Formatting**: Follow existing code style
- **Comments**: Add comments for complex logic
- **Error Handling**: Always handle errors gracefully
- **Naming**: Use descriptive variable and function names

### Commit Message Convention

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add markdown support to editor`

## Questions?

Feel free to open an issue for any questions about contributing.

Thank you for making CollabNotes better! 🎉
