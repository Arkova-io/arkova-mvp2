/**
 * useInviteMember Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist the mock function
const mockRpc = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: mockRpc,
  },
}));

// Import after mocks
import { renderHook, act } from '@testing-library/react';
import { useInviteMember } from './useInviteMember';

describe('useInviteMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully invite a member', async () => {
    mockRpc.mockResolvedValue({ data: 'invite-uuid', error: null });

    const { result } = renderHook(() => useInviteMember());

    let success: boolean;
    await act(async () => {
      success = await result.current.inviteMember('test@example.com', 'INDIVIDUAL', 'org-123');
    });

    expect(success!).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('invite_member', {
      invite_email: 'test@example.com',
      invite_role: 'INDIVIDUAL',
      org_id: 'org-123',
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle already a member error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'User is already a member of this organization' },
    });

    const { result } = renderHook(() => useInviteMember());

    let success: boolean;
    await act(async () => {
      success = await result.current.inviteMember('test@example.com', 'INDIVIDUAL', 'org-123');
    });

    expect(success!).toBe(false);
    expect(result.current.error).toContain('already a member');
  });

  it('should handle insufficient privilege error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'insufficient_privilege: Only org admins can invite' },
    });

    const { result } = renderHook(() => useInviteMember());

    let success: boolean;
    await act(async () => {
      success = await result.current.inviteMember('test@example.com', 'ORG_ADMIN', 'org-123');
    });

    expect(success!).toBe(false);
    expect(result.current.error).toContain('permission');
  });

  it('should handle invalid email error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'invalid email format' },
    });

    const { result } = renderHook(() => useInviteMember());

    let success: boolean;
    await act(async () => {
      success = await result.current.inviteMember('bad-email', 'INDIVIDUAL', 'org-123');
    });

    expect(success!).toBe(false);
    expect(result.current.error).toContain('valid email');
  });

  it('should clear error when clearError is called', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'Some error' },
    });

    const { result } = renderHook(() => useInviteMember());

    await act(async () => {
      await result.current.inviteMember('test@example.com', 'INDIVIDUAL', 'org-123');
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
