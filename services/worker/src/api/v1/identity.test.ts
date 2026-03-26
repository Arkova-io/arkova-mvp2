/**
 * Identity Verification API Tests (IDT WS1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { identityRouter } from './identity.js';

// Mock stripe
vi.mock('../../stripe/client.js', () => ({
  stripe: {
    identity: {
      verificationSessions: {
        create: vi.fn().mockResolvedValue({
          id: 'vs_test_123',
          client_secret: 'vs_test_secret_123',
          status: 'requires_input',
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'vs_test_123',
          client_secret: 'vs_test_secret_123',
          status: 'requires_input',
        }),
      },
    },
  },
}));

// Mock supabase admin
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('../../supabase.js', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          error: null,
        }),
      }),
    })),
  },
}));

vi.mock('../../config.js', () => ({
  config: {
    useMocks: false,
  },
}));

vi.mock('../../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createApp() {
  const app = express();
  app.use(express.json());
  // Inject userId for auth
  app.use((req, _res, next) => {
    (req as unknown as { userId?: string }).userId = 'test-user-123';
    next();
  });
  app.use('/identity', identityRouter);
  return app;
}

describe('Identity API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /identity/session', () => {
    it('creates a verification session for unstarted user', async () => {
      mockSingle.mockResolvedValue({
        data: { identity_verification_status: 'unstarted', identity_verification_session_id: null },
        error: null,
      });

      const app = createApp();
      const res = await request(app).post('/identity/session').send();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sessionId', 'vs_test_123');
      expect(res.body).toHaveProperty('clientSecret', 'vs_test_secret_123');
    });

    it('rejects already-verified users', async () => {
      mockSingle.mockResolvedValue({
        data: { identity_verification_status: 'verified', identity_verification_session_id: 'vs_old' },
        error: null,
      });

      const app = createApp();
      const res = await request(app).post('/identity/session').send();

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Identity already verified');
    });
  });

  describe('GET /identity/status', () => {
    it('returns verification status', async () => {
      mockSingle.mockResolvedValue({
        data: { identity_verification_status: 'verified', identity_verified_at: '2026-03-26T12:00:00Z' },
        error: null,
      });

      const app = createApp();
      const res = await request(app).get('/identity/status').send();

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('verified');
      expect(res.body.verifiedAt).toBe('2026-03-26T12:00:00Z');
    });
  });
});
