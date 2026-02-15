/**
 * CSV Upload Wizard Component
 *
 * Multi-step wizard for bulk document anchoring via CSV upload.
 */

import { useState, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Step = 'upload' | 'mapping' | 'validation' | 'processing' | 'complete';

interface CSVColumn {
  index: number;
  name: string;
  sample: string;
}

interface ColumnMapping {
  fingerprint: number | null;
  filename: number | null;
  fileSize: number | null;
}

interface ValidationResult {
  valid: number;
  invalid: number;
  errors: Array<{ row: number; message: string }>;
}

interface ProcessingResult {
  total: number;
  successful: number;
  failed: number;
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'mapping', label: 'Map Columns' },
  { key: 'validation', label: 'Validate' },
  { key: 'processing', label: 'Process' },
  { key: 'complete', label: 'Complete' },
];

interface CSVUploadWizardProps {
  onComplete?: (result: ProcessingResult) => void;
  onCancel?: () => void;
}

export function CSVUploadWizard({ onComplete, onCancel }: CSVUploadWizardProps) {
  const [step, setStep] = useState<Step>('upload');
  const [, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<CSVColumn[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    fingerprint: null,
    filename: null,
    fileSize: null,
  });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [processing, setProcessing] = useState<{
    progress: number;
    current: number;
    total: number;
  } | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  const handleFileUpload = useCallback(async (_uploadedFile: File) => {
    setError(null);
    // In production, parse the actual file. For now use mock data.
    // const parsedData = parseCSV(_uploadedFile);

    // Parse CSV headers (simulate)
    // In real implementation, use a CSV parser library
    const mockColumns: CSVColumn[] = [
      { index: 0, name: 'filename', sample: 'document.pdf' },
      { index: 1, name: 'fingerprint', sample: 'a1b2c3d4e5f6...' },
      { index: 2, name: 'size', sample: '1024' },
      { index: 3, name: 'description', sample: 'Contract file' },
    ];
    setColumns(mockColumns);

    // Auto-detect mapping
    setMapping({
      fingerprint: mockColumns.find(c => c.name.toLowerCase().includes('fingerprint'))?.index ?? null,
      filename: mockColumns.find(c => c.name.toLowerCase().includes('filename') || c.name.toLowerCase().includes('name'))?.index ?? null,
      fileSize: mockColumns.find(c => c.name.toLowerCase().includes('size'))?.index ?? null,
    });

    setStep('mapping');
  }, []);

  const handleValidate = useCallback(async () => {
    setStep('validation');
    setError(null);

    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockValidation: ValidationResult = {
      valid: 47,
      invalid: 3,
      errors: [
        { row: 12, message: 'Invalid fingerprint format' },
        { row: 28, message: 'Missing filename' },
        { row: 45, message: 'Duplicate fingerprint' },
      ],
    };
    setValidation(mockValidation);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!validation) return;

    setStep('processing');
    setError(null);

    const total = validation.valid;
    setProcessing({ progress: 0, current: 0, total });

    // Simulate processing
    for (let i = 0; i <= total; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setProcessing({
        progress: (i / total) * 100,
        current: i,
        total,
      });
    }

    const processingResult: ProcessingResult = {
      total,
      successful: total - 2,
      failed: 2,
    };
    setResult(processingResult);
    setStep('complete');
    onComplete?.(processingResult);
  }, [validation, onComplete]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setColumns([]);
    setMapping({ fingerprint: null, filename: null, fileSize: null });
    setValidation(null);
    setProcessing(null);
    setResult(null);
    setError(null);
  }, []);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Bulk Upload Records
            </CardTitle>
            <CardDescription>
              Upload a CSV file to secure multiple documents at once.
            </CardDescription>
          </div>
          {onCancel && step !== 'processing' && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Progress steps */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s, index) => (
            <div key={s.key} className="flex items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  index < currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index < currentStepIndex ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-8 mx-2',
                    index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map(s => (
            <span
              key={s.key}
              className={cn(
                'text-xs',
                s.key === step ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <Separator />

      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step: Upload */}
        {step === 'upload' && (
          <UploadStep onFileUpload={handleFileUpload} />
        )}

        {/* Step: Column Mapping */}
        {step === 'mapping' && (
          <MappingStep
            columns={columns}
            mapping={mapping}
            onMappingChange={setMapping}
            onBack={() => setStep('upload')}
            onNext={handleValidate}
          />
        )}

        {/* Step: Validation */}
        {step === 'validation' && (
          <ValidationStep
            validation={validation}
            onBack={() => setStep('mapping')}
            onProcess={handleProcess}
          />
        )}

        {/* Step: Processing */}
        {step === 'processing' && processing && (
          <ProcessingStep
            progress={processing.progress}
            current={processing.current}
            total={processing.total}
          />
        )}

        {/* Step: Complete */}
        {step === 'complete' && result && (
          <CompleteStep result={result} onReset={handleReset} />
        )}
      </CardContent>
    </Card>
  );
}

// Sub-components for each step

function UploadStep({ onFileUpload }: { onFileUpload: (file: File) => void }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      <label
        htmlFor="csv-upload"
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-muted-foreground/50 transition-colors"
      >
        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm font-medium mb-1">Drop your CSV file here</p>
        <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
        <Button type="button" variant="secondary" size="sm">
          Select CSV File
        </Button>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={handleChange}
        />
      </label>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Required columns: fingerprint, filename</p>
        <p>Optional columns: file_size</p>
      </div>
    </div>
  );
}

function MappingStep({
  columns,
  mapping,
  onMappingChange,
  onBack,
  onNext,
}: {
  columns: CSVColumn[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const isValid = mapping.fingerprint !== null && mapping.filename !== null;

  const renderSelect = (
    label: string,
    value: number | null,
    onChange: (value: number | null) => void,
    required?: boolean
  ) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        className="w-48 rounded-md border border-input bg-background px-3 py-1 text-sm"
      >
        <option value="">Select column</option>
        {columns.map((col) => (
          <option key={col.index} value={col.index}>
            {col.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {renderSelect(
          'Fingerprint',
          mapping.fingerprint,
          (v) => onMappingChange({ ...mapping, fingerprint: v }),
          true
        )}
        <Separator />
        {renderSelect(
          'Filename',
          mapping.filename,
          (v) => onMappingChange({ ...mapping, filename: v }),
          true
        )}
        <Separator />
        {renderSelect(
          'File Size',
          mapping.fileSize,
          (v) => onMappingChange({ ...mapping, fileSize: v })
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Validate
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ValidationStep({
  validation,
  onBack,
  onProcess,
}: {
  validation: ValidationResult | null;
  onBack: () => void;
  onProcess: () => void;
}) {
  if (!validation) {
    return (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Validating records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-success/50 bg-success/5">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-success">{validation.valid}</div>
            <p className="text-sm text-muted-foreground">Valid records</p>
          </CardContent>
        </Card>
        <Card className={cn(validation.invalid > 0 && 'border-destructive/50 bg-destructive/5')}>
          <CardContent className="pt-4">
            <div className={cn('text-2xl font-bold', validation.invalid > 0 ? 'text-destructive' : '')}>
              {validation.invalid}
            </div>
            <p className="text-sm text-muted-foreground">Invalid records</p>
          </CardContent>
        </Card>
      </div>

      {validation.errors.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validation.errors.slice(0, 5).map((err, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono">{err.row}</TableCell>
                  <TableCell className="text-destructive">{err.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {validation.errors.length > 5 && (
            <div className="px-4 py-2 text-xs text-muted-foreground border-t">
              And {validation.errors.length - 5} more errors...
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onProcess} disabled={validation.valid === 0}>
          Process {validation.valid} Records
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ProcessingStep({
  progress,
  current,
  total,
}: {
  progress: number;
  current: number;
  total: number;
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
      <div className="text-center space-y-2">
        <p className="font-medium">Processing records...</p>
        <p className="text-sm text-muted-foreground">
          {current} of {total} records
        </p>
      </div>
      <Progress value={progress} className="w-full" />
      <p className="text-xs text-center text-muted-foreground">
        Please do not close this window
      </p>
    </div>
  );
}

function CompleteStep({
  result,
  onReset,
}: {
  result: ProcessingResult;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4 py-4 text-center">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Upload Complete</h3>
        <p className="text-sm text-muted-foreground">
          Your records have been processed.
        </p>
      </div>

      <div className="flex justify-center gap-4 pt-2">
        <Badge variant="success" className="text-base px-4 py-1">
          {result.successful} Secured
        </Badge>
        {result.failed > 0 && (
          <Badge variant="destructive" className="text-base px-4 py-1">
            {result.failed} Failed
          </Badge>
        )}
      </div>

      <Button onClick={onReset} className="mt-4">
        Upload Another File
      </Button>
    </div>
  );
}
