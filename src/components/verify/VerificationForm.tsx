/**
 * Verification Form Component
 *
 * Allows users to verify a document by uploading it or entering a fingerprint.
 */

import { useState, useCallback } from 'react';
import { Search, Shield, CheckCircle, XCircle, Loader2, FileText, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type VerificationMethod = 'file' | 'fingerprint';

interface VerificationResult {
  verified: boolean;
  fingerprint: string;
  filename?: string;
  securedAt?: string;
  status?: 'PENDING' | 'SECURED' | 'REVOKED';
}

interface VerificationFormProps {
  onVerify?: (result: VerificationResult) => void;
}

export function VerificationForm({ onVerify }: VerificationFormProps) {
  const [method, setMethod] = useState<VerificationMethod>('file');
  const [fingerprint, setFingerprint] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateFingerprint = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const verifyFingerprint = useCallback(async (fp: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Demo: verify if fingerprint looks valid (64 hex chars)
      const isValidFormat = /^[a-f0-9]{64}$/i.test(fp);

      if (!isValidFormat) {
        setError('Invalid fingerprint format. Please enter a valid 64-character fingerprint.');
        setLoading(false);
        return;
      }

      // Demo: randomly determine if document is found
      const found = Math.random() > 0.3;

      if (found) {
        const verificationResult: VerificationResult = {
          verified: true,
          fingerprint: fp,
          filename: 'document.pdf',
          status: 'SECURED',
          securedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        };
        setResult(verificationResult);
        onVerify?.(verificationResult);
      } else {
        const verificationResult: VerificationResult = {
          verified: false,
          fingerprint: fp,
        };
        setResult(verificationResult);
        onVerify?.(verificationResult);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [onVerify]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fp = await generateFingerprint(file);
      setFingerprint(fp);
      await verifyFingerprint(fp);
    } catch {
      setError('Failed to process file. Please try again.');
      setLoading(false);
    }
  }, [verifyFingerprint]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fingerprint.trim()) return;
    await verifyFingerprint(fingerprint.trim());
  }, [fingerprint, verifyFingerprint]);

  return (
    <div className="space-y-6">
      {/* Method toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setMethod('file')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            method === 'file'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
        <button
          type="button"
          onClick={() => setMethod('fingerprint')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            method === 'fingerprint'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Search className="h-4 w-4" />
          Enter Fingerprint
        </button>
      </div>

      {/* File upload */}
      {method === 'file' && (
        <div>
          <Label htmlFor="verify-file" className="sr-only">
            Select document to verify
          </Label>
          <label
            htmlFor="verify-file"
            className={cn(
              'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
              'hover:border-muted-foreground/50',
              loading && 'pointer-events-none opacity-50'
            )}
          >
            <FileText className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">Drop your document here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
            <input
              id="verify-file"
              type="file"
              className="sr-only"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>
        </div>
      )}

      {/* Fingerprint input */}
      {method === 'fingerprint' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fingerprint">Document Fingerprint</Label>
            <Input
              id="fingerprint"
              type="text"
              value={fingerprint}
              onChange={(e) => setFingerprint(e.target.value)}
              placeholder="Enter 64-character fingerprint"
              className="font-mono text-sm"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              The fingerprint is a unique 64-character identifier for your document.
            </p>
          </div>
          <Button type="submit" disabled={loading || !fingerprint.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Verify Document
              </>
            )}
          </Button>
        </form>
      )}

      {/* Error message */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-4">
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <>
          <Separator />
          <VerificationResult result={result} />
        </>
      )}
    </div>
  );
}

function VerificationResult({ result }: { result: VerificationResult }) {
  if (result.verified) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardContent className="py-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 mb-4">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-success mb-1">
              Document Verified
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This document has been secured and can be trusted.
            </p>

            <div className="w-full space-y-3 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-success">Secured</span>
              </div>
              {result.securedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Secured on</span>
                  <span className="font-medium">
                    {new Date(result.securedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Fingerprint</p>
                <p className="text-xs font-mono bg-muted rounded px-2 py-1 break-all">
                  {result.fingerprint}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-muted">
      <CardContent className="py-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Shield className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            No Record Found
          </h3>
          <p className="text-sm text-muted-foreground">
            This document has not been secured with Arkova.
            It may be unverified or the fingerprint may be incorrect.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
