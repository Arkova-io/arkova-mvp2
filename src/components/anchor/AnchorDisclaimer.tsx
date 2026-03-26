/**
 * Anchor Disclaimer Notice (IDT WS3)
 *
 * Compact legal disclaimer shown on anchor detail and public verification pages.
 * Explains what Arkova does and does not guarantee about anchored records.
 *
 * @see DISCLAIMER_LABELS in src/lib/copy.ts
 */

import { Info } from 'lucide-react';
import { DISCLAIMER_LABELS } from '@/lib/copy';

/**
 * Compact disclaimer for embedding in record/verification views.
 * Uses a muted style to avoid visual competition with the proof data.
 */
export function AnchorDisclaimer() {
  return (
    <div className="rounded-lg border border-muted bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
      <div className="flex items-start gap-2">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-foreground/70 mb-1">{DISCLAIMER_LABELS.title}</p>
          <p>
            A secured record confirms that a document fingerprint was anchored at a given time.
            Arkova does not verify truthfulness, guarantee authenticity, provide legal certification,
            or replace official verification processes.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Dark-themed disclaimer variant for public-facing pages (dark background).
 */
export function AnchorDisclaimerDark() {
  return (
    <div className="rounded-lg border border-[#bbc9cf]/10 bg-[#0d141b]/50 px-4 py-3 text-xs text-[#bbc9cf]">
      <div className="flex items-start gap-2">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#bbc9cf]" />
        <div>
          <p className="font-medium text-[#dce3ed] mb-1">{DISCLAIMER_LABELS.title}</p>
          <p>
            A secured record confirms that a document fingerprint was anchored at a given time.
            Arkova does not verify truthfulness, guarantee authenticity, provide legal certification,
            or replace official verification processes.
          </p>
        </div>
      </div>
    </div>
  );
}
