/**
 * Public Verification Page Component
 *
 * Public-facing page for verifying documents without authentication.
 */

import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VerificationForm } from '@/components/verify';

interface PublicVerifyPageProps {
  fingerprintFromUrl?: string;
}

// Note: fingerprintFromUrl can be used to pre-populate verification form

export function PublicVerifyPage({ fingerprintFromUrl: _fingerprintFromUrl }: PublicVerifyPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Arkova</span>
          </div>
          <nav>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-12">
        <div className="max-w-xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              Verify a Document
            </h1>
            <p className="text-muted-foreground">
              Check if a document has been secured with Arkova.
              Upload the file or enter its fingerprint to verify authenticity.
            </p>
          </div>

          {/* Verification card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Document Verification</CardTitle>
              <CardDescription>
                Verify that a document matches a secured record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationForm />
            </CardContent>
          </Card>

          {/* Info section */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoCard
              title="Secure"
              description="Documents are verified using cryptographic fingerprints"
            />
            <InfoCard
              title="Private"
              description="Your document never leaves your device during verification"
            />
            <InfoCard
              title="Instant"
              description="Get verification results in seconds"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Arkova - Secure Document Verification
          </p>
          <nav className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
