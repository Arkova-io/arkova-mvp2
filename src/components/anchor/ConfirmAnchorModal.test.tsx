/**
 * ConfirmAnchorModal Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ConfirmAnchorModal } from './ConfirmAnchorModal';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    profile: { org_id: null },
  }),
}));

describe('ConfirmAnchorModal', () => {
  const mockFile = new File(['test content'], 'test.pdf', {
    type: 'application/pdf',
  });
  const mockFingerprint = 'a'.repeat(64);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display file info and fingerprint', () => {
    const { getByText } = render(
      <ConfirmAnchorModal
        open={true}
        onOpenChange={() => {}}
        file={mockFile}
        fingerprint={mockFingerprint}
      />
    );

    expect(getByText('test.pdf')).toBeInTheDocument();
    expect(getByText(/Document Fingerprint/i)).toBeInTheDocument();
    expect(getByText(mockFingerprint)).toBeInTheDocument();
  });

  it('should show Pending status notice', () => {
    const { getByText } = render(
      <ConfirmAnchorModal
        open={true}
        onOpenChange={() => {}}
        file={mockFile}
        fingerprint={mockFingerprint}
      />
    );

    expect(getByText(/Pending/i)).toBeInTheDocument();
  });

  it('should call onOpenChange when cancel clicked', () => {
    const onOpenChange = vi.fn();

    const { getByText } = render(
      <ConfirmAnchorModal
        open={true}
        onOpenChange={onOpenChange}
        file={mockFile}
        fingerprint={mockFingerprint}
      />
    );

    getByText('Cancel').click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not render if file is null', () => {
    const { queryByText } = render(
      <ConfirmAnchorModal
        open={true}
        onOpenChange={() => {}}
        file={null}
        fingerprint={mockFingerprint}
      />
    );

    expect(queryByText('Confirm Anchor')).not.toBeInTheDocument();
  });

  it('should not render if fingerprint is null', () => {
    const { queryByText } = render(
      <ConfirmAnchorModal
        open={true}
        onOpenChange={() => {}}
        file={mockFile}
        fingerprint={null}
      />
    );

    expect(queryByText('Confirm Anchor')).not.toBeInTheDocument();
  });
});
