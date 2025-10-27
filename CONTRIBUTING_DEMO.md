# Contributing to Halo Protocol Demo

Thank you for your interest in improving the Halo Protocol demo! This guide will help you understand how to contribute effectively.

## 🎯 Areas for Contribution

### 1. Demo Scripts Enhancement

**Location:** `app/`

#### Easy Improvements
- Add more member personalities (different contribution patterns)
- Create additional demo scenarios
- Improve error messages and user feedback
- Add more detailed logging options

#### Medium Improvements
- Add support for multiple circles in parallel
- Implement defaulting member scenarios
- Create visual ASCII art for console output
- Add export functionality (JSON, CSV)

#### Advanced Improvements
- Real Solend integration on devnet
- Actual Switchboard automation setup
- Integration with real USDC on devnet
- Performance optimization for large circles

### 2. Frontend Dashboard

**Location:** `frontend/src/`

#### Easy Improvements
- Add more animations and transitions
- Improve mobile responsiveness
- Add dark/light theme toggle
- Create more color themes

#### Medium Improvements
- Add charts and graphs (Recharts)
- Implement real-time notifications
- Add member profile pages
- Create analytics dashboard

#### Advanced Improvements
- Real-time WebSocket connections
- Advanced data visualization
- Multi-circle management
- Admin panel for circle creators

### 3. Documentation

**Location:** Root directory `*.md` files

#### Easy Improvements
- Fix typos and grammar
- Add more examples
- Improve formatting
- Add FAQ section

#### Medium Improvements
- Create video tutorials
- Add troubleshooting scenarios
- Write blog posts about features
- Create API documentation

#### Advanced Improvements
- Interactive documentation
- Complete architecture diagrams
- Security audit documentation
- Performance benchmarks

### 4. Testing

**Location:** `tests/`

#### Easy Improvements
- Add more unit tests
- Improve test coverage
- Add edge case tests
- Document test scenarios

#### Medium Improvements
- Integration tests for demo scripts
- Frontend component tests
- E2E tests with Playwright
- Performance benchmarks

#### Advanced Improvements
- Load testing
- Security testing
- Fuzzing tests
- CI/CD pipeline

## 🔧 Development Setup

### Prerequisites
```bash
# Required
- Node.js 16+
- npm or yarn
- Git

# Optional but recommended
- Solana CLI
- Anchor CLI
- VS Code with extensions
```

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/kunal-drall/halo.git
cd halo

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Run setup script
./scripts/setup-demo.sh
```

### Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
```bash
# Edit files in your preferred editor
code .
```

3. **Test your changes**
```bash
# For demo scripts
npm run demo

# For frontend
cd frontend
npm run dev

# Run linting
npm run lint
```

4. **Commit your changes**
```bash
git add .
git commit -m "feat: add your feature description"
```

5. **Push and create PR**
```bash
git push origin feature/your-feature-name
# Then create a pull request on GitHub
```

## 📝 Code Style Guide

### TypeScript/JavaScript

```typescript
// Use clear, descriptive names
const calculateMonthlyPot = (contributions: number, yieldEarned: number) => {
  return contributions + yieldEarned;
};

// Add JSDoc comments for functions
/**
 * Calculates the total pot for distribution
 * @param contributions - Total member contributions
 * @param yieldEarned - Yield from Solend
 * @returns Total pot amount
 */
const calculatePot = (contributions: number, yieldEarned: number): number => {
  return contributions + yieldEarned;
};

// Use async/await for promises
const fetchCircleData = async (circleAddress: PublicKey) => {
  try {
    const data = await program.account.circle.fetch(circleAddress);
    return data;
  } catch (error) {
    console.error('Failed to fetch circle:', error);
    throw error;
  }
};

// Prefer const over let
const memberCount = 5;

// Use meaningful error messages
throw new Error(`Circle ${circleAddress} not found on devnet`);
```

### React/Next.js Components

```tsx
// Use functional components with TypeScript
interface MemberCardProps {
  name: string;
  trustScore: number;
  tier: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ name, trustScore, tier }) => {
  return (
    <div className="member-card">
      <h3>{name}</h3>
      <p>Score: {trustScore}</p>
      <span>{tier}</span>
    </div>
  );
};

// Use hooks appropriately
const [loading, setLoading] = useState(false);

useEffect(() => {
  loadData();
}, []);

// Separate concerns
const useMemberData = (memberId: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMemberData(memberId).then(setData).finally(() => setLoading(false));
  }, [memberId]);
  
  return { data, loading };
};
```

### Documentation

```markdown
# Use clear headings

## Section Title

Brief description of what this section covers.

### Subsection

- Use bullet points for lists
- Keep explanations concise
- Provide examples

### Code Examples

\`\`\`typescript
// Always include code examples
const example = "with comments";
\`\`\`

### Tips

💡 **Tip:** Use emojis to highlight important information
⚠️ **Warning:** Clearly mark warnings
✅ **Success:** Show what success looks like
```

## 🧪 Testing Guidelines

### Writing Tests

```typescript
import { expect } from 'chai';

describe('Circle Demo', () => {
  it('should initialize a 5-member circle', async () => {
    const circle = await initializeCircle({
      contributionAmount: 10_000_000,
      durationMonths: 5,
      maxMembers: 5,
      penaltyRate: 1000,
    });
    
    expect(circle).to.exist;
    expect(circle.maxMembers).to.equal(5);
  });
  
  it('should allow members to join with correct stake', async () => {
    const member = await joinCircle({
      circle: circleAddress,
      stakeAmount: 20_000_000,
    });
    
    expect(member.stakeAmount.toNumber()).to.equal(20_000_000);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/demo.test.ts

# Run with coverage
npm run test:coverage
```

## 📋 Pull Request Guidelines

### PR Title Format
```
<type>(<scope>): <subject>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks

Examples:
- feat(demo): add support for 10-member circles
- fix(dashboard): correct trust score calculation
- docs(readme): update setup instructions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Updated documentation

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No breaking changes
```

## 🐛 Reporting Issues

### Issue Template

```markdown
**Description**
Clear description of the issue

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 12.0]
- Node: [e.g., 16.14.0]
- npm: [e.g., 8.3.1]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered

**Additional Context**
Mockups, examples, etc.
```

## 🎓 Learning Resources

### Solana Development
- [Solana Cookbook](https://solanacookbook.com/)
- [Anchor Book](https://book.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)

### Frontend Development
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/docs)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## 🏆 Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Top contributors may receive:
- Direct mentions in social media
- Early access to new features
- Invitations to contributor calls

## 📞 Getting Help

### Community Channels
- GitHub Discussions: For questions and ideas
- GitHub Issues: For bugs and feature requests
- Discord: For real-time chat (coming soon)

### Contact Maintainers
- Create an issue for technical questions
- Email for security concerns
- Tag maintainers in PRs for reviews

## 🎨 Design Guidelines

### UI/UX Principles
1. **Clarity**: Make information easy to understand
2. **Consistency**: Use consistent patterns
3. **Feedback**: Provide clear user feedback
4. **Accessibility**: Support all users
5. **Performance**: Keep it fast and responsive

### Color Palette
```css
/* Primary Colors */
--purple-600: #8B5CF6;
--purple-700: #7C3AED;

/* Status Colors */
--green-400: #4ADE80;
--yellow-400: #FACC15;
--red-400: #F87171;
--blue-400: #60A5FA;

/* Neutral Colors */
--gray-800: #1F2937;
--gray-700: #374151;
--gray-400: #9CA3AF;
```

## 🔒 Security

### Reporting Security Issues
- Do NOT open public issues for security vulnerabilities
- Email security concerns to maintainers
- Provide detailed reproduction steps
- Allow time for fixes before disclosure

### Security Best Practices
- Never commit private keys
- Validate all user inputs
- Use environment variables for sensitive data
- Follow least privilege principle

## 📊 Metrics and Goals

### Code Quality Metrics
- Test coverage: >80%
- TypeScript strict mode: Enabled
- ESLint warnings: 0
- Bundle size: <500KB

### Performance Goals
- Initial load: <2 seconds
- Component render: <100ms
- API response: <1 second
- Lighthouse score: >90

## 🌟 Best Practices

### General
- Write self-documenting code
- Keep functions small and focused
- Avoid premature optimization
- Comment complex logic
- Use meaningful variable names

### Git Workflow
- Commit often with clear messages
- Keep PRs focused and small
- Rebase on main before PR
- Resolve conflicts locally
- Review your own PR first

### Testing
- Write tests as you code
- Test edge cases
- Mock external dependencies
- Use descriptive test names
- Keep tests independent

## 📅 Release Process

### Version Numbering
```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features (backwards compatible)
PATCH: Bug fixes
```

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] Release notes published

## 🙏 Thank You!

Thank you for contributing to Halo Protocol! Your efforts help make this project better for everyone.

Questions? Feel free to open an issue or reach out to the maintainers.

Happy coding! 🚀
