export type ImportResource = 'clients' | 'services' | 'users' | 'payments';

export interface ImportRowResult {
  row: number;
  status: 'VALID' | 'CREATED' | 'ERROR';
  hashId: string | null;
  error: string | null;
}

export interface ImportResult {
  dryRun: boolean;
  total: number;
  successful: number;
  failed: number;
  rows: ImportRowResult[];
}
