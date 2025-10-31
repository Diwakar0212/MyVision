# Contributing to MyVision

Thank you for your interest in contributing to MyVision! 🎉

## 🌟 How to Contribute

### 1. Fork the Repository
Fork the MyVision repository to your GitHub account.

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/MyVision.git
cd MyVision
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 4. Set Up Development Environment

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your-key-here" > .env

# Download models (see docs/ADD_MODELS_HERE.md)
```

#### Frontend Setup
```bash
npm install
npm run dev
```

### 5. Make Your Changes
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly

### 6. Commit Your Changes
Use clear, descriptive commit messages:
```bash
git commit -m "feat: Add new feature"
git commit -m "fix: Fix bug in detection"
git commit -m "docs: Update README"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 7. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```
Then open a Pull Request on GitHub.

## 📋 Code Guidelines

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings to functions
- Keep functions small and focused

### TypeScript/React (Frontend)
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and reusable

## 🧪 Testing
- Test all features before submitting PR
- Ensure voice commands work properly
- Test on multiple browsers (frontend changes)
- Verify detection accuracy (backend changes)

## 📝 Documentation
- Update README if adding new features
- Add comments for complex code
- Update API documentation if needed
- Create/update docs in `docs/` folder

## 🐛 Reporting Bugs
Use the Bug Report template when creating issues:
- Describe the bug clearly
- Provide steps to reproduce
- Include error messages
- Specify your environment

## 💡 Suggesting Features
Use the Feature Request template:
- Explain the feature clearly
- Describe the use case
- Provide examples if possible

## 🎯 Priority Areas
We especially welcome contributions in:
- 🔊 Voice recognition improvements
- 🤖 AI model optimizations
- 🌐 Internationalization (i18n)
- ♿ Accessibility enhancements
- 📱 Mobile responsiveness
- 📚 Documentation
- 🧪 Testing

## ❓ Questions?
Feel free to open an issue for any questions!

## 📜 License
By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

**Thank you for making MyVision better! ❤️**
