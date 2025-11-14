# Testing Guide

This project now includes comprehensive test coverage using Vitest.

## Quick Start

```bash
# Run tests in watch mode
yarn test

# Run tests once (for CI)
yarn test --run

# Run tests with UI
yarn test:ui

# Generate coverage report
yarn test:coverage
```

## Test Structure

### Current Test Coverage

1. **i18n Path Generation** (`src/i18n/path.test.ts`)
   - Tag path generation with language prefixes
   - Localized path handling
   - Language switching logic
   - Multi-language cycling

2. **Description Generation** (`src/utils/description.test.ts`)
   - Excerpt generation from Markdown
   - CJK vs non-CJK language handling
   - HTML entity decoding
   - Text normalization
   - Length calculations for different scenes (list, meta, og, rss)

### Skipped Tests

**Content Utilities** (`src/utils/content.test.ts.skip`)
- Currently skipped due to Astro content collections requiring server-side runtime
- Contains tests for slug duplication detection
- Will be enabled once proper mocking is configured

## Coverage Areas

### High Priority (Implemented)
- ✅ i18n path generation and URL handling
- ✅ Description and excerpt generation
- ⏸️  Content utilities (slug validation) - partially implemented

### Medium Priority (Future)
- ⬜ RSS feed generation
- ⬜ Remark/Rehype plugins
- ⬜ Reading time calculation

### Integration Tests (Future)
- ⬜ Full page generation flows
- ⬜ Multi-language content rendering

## CI/CD Integration

Tests run automatically on:
- Push to `master`, `main`, or `develop` branches
- Pull requests to `master` or `main`

See `.github/workflows/test.yml` for the full CI configuration.

## Test Configuration

The test setup uses:
- **Vitest** - Fast unit test framework
- **happy-dom** - Lightweight DOM implementation
- **@vitest/ui** - Visual test interface
- **@vitest/coverage-v8** - Code coverage reporting

Configuration is in `vitest.config.ts`.

## Writing Tests

### Example Test Structure

```typescript
import { describe, expect, it } from 'vitest'
import { yourFunction } from './your-module'

describe('yourFunction', () => {
  it('should handle basic case', () => {
    const result = yourFunction('input')
    expect(result).toBe('expected output')
  })

  it('should handle edge case', () => {
    const result = yourFunction('')
    expect(result).toBe('')
  })
})
```

### Testing Guidelines

1. **Avoid Astro Runtime Dependencies**
   - Tests run in a Node environment, not Astro's server
   - Mock Astro-specific imports when necessary
   - Use type aliases instead of importing from `astro:content`

2. **Test File Naming**
   - Place tests next to source files: `module.test.ts` for `module.ts`
   - Use `.skip` suffix to temporarily disable: `module.test.ts.skip`

3. **Coverage Goals**
   - Focus on pure functions and utilities
   - Test edge cases and error conditions
   - Aim for high coverage on critical paths (URL generation, content processing)

## Troubleshooting

### "astro:content module is only available server-side"

This error occurs when tests try to import Astro content collections. Solutions:
- Create type aliases instead of importing types from `astro:content`
- Mock the Astro content collections API
- Move tests to integration test suite with Astro runtime

### Tests not running

Check that:
- Dependencies are installed: `yarn install`
- Vitest is configured: `vitest.config.ts` exists
- Test files match pattern: `**/*.test.ts`

## Future Improvements

1. **Astro Content Collection Mocking**
   - Enable testing of functions that use `getCollection()`
   - Re-enable `content.test.ts.skip` tests

2. **Integration Tests**
   - Test full Astro page builds
   - Verify RSS/Atom feed generation
   - Test Open Graph image generation

3. **Snapshot Testing**
   - Test Markdown rendering output
   - Verify HTML structure of components

4. **Performance Testing**
   - Benchmark critical path operations
   - Test with large content collections
