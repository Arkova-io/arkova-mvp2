# Arkova MVP - Development Guidelines

## Quick Start Commands

```bash
# Start Supabase locally
supabase start

# Reset database (runs migrations + seed)
supabase db reset

# Generate TypeScript types from schema
npm run gen:types

# Start development server
npm run dev

# Run all tests
npm test

# Run RLS integration tests
npm run test:rls

# Run linting
npm run lint

# Check UI copy for forbidden terms
npm run lint:copy
# or directly:
npx tsx scripts/check-copy-terms.ts
```

## Worker Service

The anchoring worker is a dedicated Node.js service located at `services/worker/`.

```bash
# Navigate to worker
cd services/worker

# Install dependencies
npm install

# Start worker in development
npm run dev

# Build for production
npm run build

# Run worker
npm start
```

**Important**: Next.js API routes are FORBIDDEN. All backend logic must run in the worker service.

## Schema-First Development

1. Create migrations in `supabase/migrations/`
2. Add rollback notes to every migration
3. Enable RLS on all tables
4. Run `supabase db reset`
5. Run `npm run gen:types`
6. Update documentation in same PR

## Documentation Requirements

When changing schema or features:
- Update relevant docs in `docs/confluence/`
- Required docs: 01-11 (see docs folder)
- Docs must be updated in the same PR as code changes

## UI Terminology

### Forbidden Terms (NEVER use in UI)
- Wallet
- Gas
- Hash
- Block
- Transaction
- Crypto
- Cryptocurrency
- Bitcoin
- Blockchain

### Required Terms
- Vault (not Wallet)
- Anchor
- Fingerprint (not Hash)
- Record (not Block/Transaction)
- Secure
- Verify

### Priority 7 Terminology
- Fee Account / Billing Account (not Wallet)
- Network Receipt / Anchor Receipt (not Transaction)
- Test Environment (not Testnet)
- Production Network (not Mainnet)

Run `npm run lint:copy` to check for violations.

## Security Requirements

- RLS enabled on ALL tables
- FORCE ROW LEVEL SECURITY on all tables
- Revoke public grants
- Role immutability enforced via trigger
- Audit events are append-only
- Never expose service keys to client
- All `.env` files gitignored
- Secret scanning in CI (TruffleHog, Gitleaks)
- All timestamps are `timestamptz` (UTC)

## Non-Custodial Model

Arkova does NOT:
- Store user cryptocurrency
- Accept deposits
- Process withdrawals
- Hold user private keys

All on-chain fees are paid from a corporate fee account.

## Testing

```bash
# Unit tests
npm test

# RLS integration tests (requires Supabase running)
npm run test:rls

# Type checking
npm run typecheck

# Full lint
npm run lint && npm run lint:copy
```

## Seed Data

Demo users for local testing:

| Email | Password | Role |
|-------|----------|------|
| admin_demo@arkova.local | demo_password_123 | ORG_ADMIN |
| user_demo@arkova.local | demo_password_123 | INDIVIDUAL |
| beta_admin@betacorp.local | demo_password_123 | ORG_ADMIN |

## End of Task Checklist

Before completing any task:

- [ ] Tests pass (`npm test`)
- [ ] RLS tests pass (`npm run test:rls`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Lint passes (`npm run lint`)
- [ ] Copy lint passes (`npm run lint:copy`)
- [ ] Types regenerated if schema changed (`npm run gen:types`)
- [ ] Documentation updated if schema changed
- [ ] No forbidden terminology in UI code
