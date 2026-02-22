## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Dependency update
- [ ] Other (please describe):

## Related Issues

<!-- Link to related issues using #issue_number -->

Fixes #
Relates to #

## Changes Made

<!-- Provide a detailed description of the changes -->

-
-
-

## CloudStack API Changes

<!-- If this PR adds or modifies CloudStack API integrations, list them here -->

- API Command:
- Tool Name:
- Handler:
- Tool Definition:

## Testing

<!-- Describe the testing you've performed -->

### Test Environment
- Node.js version:
- CloudStack version:
- Testing method:

### Test Cases
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] CLI testing completed
- [ ] MCP server testing completed

### Test Results
<!-- Paste test output or describe test results -->

```bash
# Example test output
npm test
```

## Documentation

<!-- Documentation changes -->

- [ ] README.md updated
- [ ] API documentation updated
- [ ] Code comments added/updated
- [ ] CHANGELOG.md updated
- [ ] Migration guide provided (if breaking change)

## Code Quality Checklist

<!-- Ensure your code meets quality standards -->

- [ ] Code follows project style guidelines
- [ ] TypeScript types are properly defined
- [ ] ESLint passes with no warnings
- [ ] TypeScript compilation succeeds with no errors
- [ ] No console.log or debug statements left in code
- [ ] Error handling is comprehensive
- [ ] Code is well-commented where necessary

## Security Checklist

<!-- Security considerations -->

- [ ] No sensitive data (API keys, passwords) in code
- [ ] Input validation implemented
- [ ] No SQL injection vulnerabilities
- [ ] No command injection vulnerabilities
- [ ] Secure credential handling
- [ ] HMAC signature validation maintained

## Performance Considerations

<!-- Performance impact of changes -->

- [ ] No significant performance regression
- [ ] Async operations properly handled
- [ ] No memory leaks introduced
- [ ] CloudStack API calls optimized

## Breaking Changes

<!-- If this is a breaking change, describe the impact and migration path -->

### Impact
<!-- Describe what breaks and why -->

### Migration Path
<!-- Describe how users should update their code -->

```typescript
// Before
// ...

// After
// ...
```

## Screenshots/Output

<!-- If applicable, add screenshots or command output -->

```bash
# Example CLI output
npm run cli -- list-vms
```

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Reviewer Checklist

<!-- For reviewers -->

- [ ] Code review completed
- [ ] Tests pass
- [ ] Documentation is clear and accurate
- [ ] No security concerns
- [ ] Breaking changes properly documented
- [ ] Follows project architecture patterns
