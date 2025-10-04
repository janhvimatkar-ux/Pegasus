# Contributing to Pegasus EdTech Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Copy `.env` and configure your environment

## Development Workflow

### Making Changes

1. Write your code following the existing patterns
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass: `npm test`
5. Check code style: `npm run lint`

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Write meaningful variable and function names
- Add JSDoc comments for public functions
- Follow existing patterns in the codebase

### Commit Messages

Write clear, concise commit messages:
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Reference issues and pull requests when relevant
- First line should be 50 characters or less
- Add detailed description if needed

Examples:
```
Add support for recurring live classes

- Implement cron-based scheduling
- Add database schema for recurrence rules
- Update API endpoints
- Add tests

Fixes #123
```

### Testing

- Write unit tests for all new functionality
- Ensure tests are descriptive and maintainable
- Aim for >70% code coverage
- Test both success and failure cases
- Test edge cases

Run tests:
```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
```

### Pull Requests

1. Update your branch with the latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. Push to your fork:
   ```bash
   git push origin your-branch
   ```

3. Create a Pull Request on GitHub

4. Fill out the PR template completely

5. Wait for review and address feedback

### PR Guidelines

- One feature/fix per PR
- Keep PRs focused and reasonably sized
- Include tests
- Update documentation
- Ensure CI passes
- Request review from maintainers

## Project Structure

Understand the architecture before making changes:

```
src/
├── config/         # Configuration management
├── controllers/    # HTTP request handlers
├── middleware/     # Express middleware
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
└── utils/          # Helper functions
```

## Adding New Features

When adding a new feature:

1. **Model**: Create/update data models in `src/models/`
2. **Service**: Implement business logic in `src/services/`
3. **Controller**: Add request handlers in `src/controllers/`
4. **Routes**: Define endpoints in `src/routes/`
5. **Tests**: Add comprehensive tests in `tests/`
6. **Docs**: Update README.md and API documentation

## Reporting Bugs

Create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)
- Logs or error messages
- Screenshots if applicable

## Suggesting Features

Create an issue with:
- Clear description of the feature
- Use case and motivation
- Possible implementation approach
- Mockups or examples if applicable

## Questions?

- Check existing issues and discussions
- Read the documentation
- Ask in discussions or create an issue

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the project

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉

