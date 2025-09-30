# Contributing to ProjectClock

Thank you for your interest in contributing to ProjectClock! This document provides guidelines and information for contributors.

## 🤝 Ways to Contribute

- **Bug Reports**: Found a bug? Please create an issue with detailed information
- **Feature Requests**: Have an idea? Open an issue to discuss it
- **Code Contributions**: Submit pull requests for bug fixes or new features
- **Documentation**: Help improve our documentation and guides
- **Testing**: Test the application and report issues
- **Translations**: Help translate the app to other languages

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/projectclock.git
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🏗️ Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Project Structure

```
src/
├── main.js        # Electron main process
├── renderer.js    # Application logic
├── index.html     # UI structure
├── styles.css     # Styling
└── preload.js     # Preload scripts
```

### Running in Development

```bash
npm start
```

### Building

```bash
npm run build:dir  # Development build
npm run build:win  # Production build (Windows)
```

## 📝 Code Guidelines

### JavaScript Style

- Use modern ES6+ features
- Follow camelCase naming convention
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

### CSS Style

- Use CSS custom properties for theming
- Follow BEM naming convention where applicable
- Keep selectors specific but not overly complex
- Use Flexbox and Grid for layouts
- Ensure responsive design

### HTML Structure

- Use semantic HTML elements
- Include proper accessibility attributes
- Keep structure clean and organized
- Use meaningful IDs and classes

## 🐛 Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **System information** (OS, Node.js version, etc.)
- **Console errors** if any

## 💡 Feature Requests

When requesting features:

- **Describe the feature** clearly
- **Explain the use case** and why it's needed
- **Consider alternatives** and mention them
- **Break down complex features** into smaller parts

## 🔄 Pull Request Process

1. **Create an issue** first to discuss major changes
2. **Keep PRs focused** - one feature/fix per PR
3. **Write clear commit messages**:
   ```
   feat: add project export functionality
   fix: resolve timer reset issue
   docs: update installation instructions
   ```
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Ensure all checks pass**

### PR Title Format

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for test changes
- `chore:` for maintenance tasks

## 🧪 Testing

- Test the application on your target platform
- Verify that existing functionality still works
- Test edge cases and error conditions
- Include screenshots for UI changes

## 📚 Documentation

- Update README.md for significant changes
- Add inline code comments for complex logic
- Update any relevant documentation files
- Include examples for new features

## 🎯 Code Review Criteria

PRs will be reviewed for:

- **Functionality**: Does it work as intended?
- **Code quality**: Is it clean and maintainable?
- **Performance**: Does it impact app performance?
- **Security**: Are there any security concerns?
- **User experience**: Does it improve the user experience?
- **Documentation**: Is it properly documented?

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested
- `wontfix`: This will not be worked on

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: Contact the maintainer at hazratali@example.com

## 📄 License

By contributing to ProjectClock, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be acknowledged in:

- README.md contributors section
- Release notes for their contributions
- Special thanks in major version releases

---

Thank you for contributing to ProjectClock! 🚀
