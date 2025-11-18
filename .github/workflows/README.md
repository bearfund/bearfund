# CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing, code quality checks, and publishing.

## Workflows

### 🔄 CI (`ci.yml`)

**Triggers**: Push to `main`/`develop`, Pull Requests

Runs on every push and PR to ensure code quality:

1. **Type Check** - TypeScript strict mode validation (`tsc --noEmit`)
2. **Lint** - ESLint with type-aware rules
3. **Format** - Prettier formatting validation
4. **Test** - Vitest with coverage reporting (uploaded to Codecov)
5. **Build** - Ensures package builds correctly and all entry points exist

**Status**: All jobs must pass for PR to be mergeable.

### 🔍 Code Quality (`code-quality.yml`)

**Triggers**: Weekly (Mondays 9 AM UTC), Manual

Runs periodic maintenance checks:

1. **Dead Code Analysis** - Knip scan for unused exports/dependencies
2. **Security Audit** - npm audit for vulnerability scanning

**Status**: Informational only (doesn't block merges).

### 📦 Publish (`publish.yml`)

**Triggers**: GitHub Release published

Automated NPM publishing:

1. Runs full check suite (type-check, lint, format, tests)
2. Builds package
3. Publishes to NPM with provenance

**Requirements**:

- `NPM_TOKEN` secret configured in repository settings
- Release must be created via GitHub UI

## Required Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret          | Purpose         | How to Get                                                                            |
| --------------- | --------------- | ------------------------------------------------------------------------------------- |
| `NPM_TOKEN`     | Publish to NPM  | [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens) (Automation token) |
| `CODECOV_TOKEN` | Upload coverage | [codecov.io](https://codecov.io) (optional, for coverage reports)                     |

## Branch Protection Rules

Recommended settings for `main` branch:

- ✅ Require status checks: `type-check`, `lint`, `format`, `test`, `build`
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Include administrators

## Local Development

Run the same checks locally:

```bash
# Full check (all CI checks)
npm run check

# Individual checks
npm run type-check  # TypeScript
npm run lint        # ESLint
npm run lint:fix    # ESLint with auto-fix
npm run format:check # Prettier check
npm run format      # Prettier auto-format
npm test            # Tests (watch mode)
npm run test:run    # Tests (single run)
npm run test:coverage # Tests with coverage
npm run knip        # Dead code analysis
```

## Pre-commit Hooks

Husky automatically runs on `git commit`:

- Prettier auto-formats staged files
- ESLint auto-fixes staged files

To skip hooks (not recommended):

```bash
git commit --no-verify
```

## Troubleshooting

### CI fails but local passes

1. Ensure you've committed all changes
2. Run `npm ci` (clean install) instead of `npm install`
3. Check Node version matches CI (v20)

### Coverage upload fails

- Codecov token is optional
- CI will pass even if upload fails
- Only needed for coverage reporting in PRs

### Publish workflow fails

1. Verify `NPM_TOKEN` is set and valid
2. Check package version in `package.json` is unique
3. Ensure `@gamerprotocol/ui` package name is available
