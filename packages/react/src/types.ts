/* ── ENS Data Types ── */

export interface ENSExpiry {
  date: string;
  timestamp: number;
  expired: boolean;
  days_left?: number;
}

export interface ENSProfile {
  name: string;
  address: string | null;
  owner: string | null;
  resolver: string | null;
  primary_name: string | null;
  expiry: ENSExpiry | null;
  text_records: Record<string, string>;
  avatar_url: string | null;
  network: string;
}

export interface ENSNameEntry {
  name: string;
  expiry: {
    date: string;
    timestamp: number;
    expired: boolean;
    days_left: number;
  } | null;
}

export interface ENSNameList {
  address: string;
  names: ENSNameEntry[];
  total: number;
  network: string;
}

export interface ENSCheckResult {
  available: boolean;
  label: string;
  fullName: string;
  price: {
    base: string;
    premium: string;
    total: string;
    total_with_buffer: string;
  } | null;
  duration_seconds: number;
  network: string;
}

/* ── Transaction Types ── */

export interface TxParams {
  to: string;
  data?: string;
  value?: string;
}

export interface TxResult {
  hash: string;
  status: 'success' | 'reverted' | 'submitted';
}

/* ── Search Types ── */

export interface SearchResult {
  query: string;
  check: ENSCheckResult;
  profile: ENSProfile | null;
}

/* ── Registration Types ── */

export type RegistrationStep = 'idle' | 'commit' | 'waiting' | 'register' | 'complete';

/* ── Config Types ── */

export type ENSFeature =
  | 'search'
  | 'profile'
  | 'register'
  | 'transfer'
  | 'records'
  | 'renew'
  | 'primary';

export interface ENSembleConfig {
  /** Base URL of the ENS Agent API (Worker) */
  apiUrl: string;
  /** Optional API key for authenticated endpoints */
  apiKey?: string;
  /** Features to enable (defaults to all) */
  features?: ENSFeature[];
}

export interface ENSembleTheme {
  /** Accent color */
  '--ens-accent'?: string;
  /** Secondary accent */
  '--ens-accent-2'?: string;
  /** Background */
  '--ens-bg'?: string;
  /** Raised surface */
  '--ens-bg-raised'?: string;
  /** Primary text */
  '--ens-text'?: string;
  /** Secondary text */
  '--ens-text-secondary'?: string;
  /** Border color */
  '--ens-border'?: string;
  /** Success color */
  '--ens-success'?: string;
  /** Warning color */
  '--ens-warning'?: string;
  /** Danger color */
  '--ens-danger'?: string;
  /** Border radius */
  '--ens-radius'?: string;
  /** Font family */
  '--ens-font'?: string;
}

/* ── API Response Types ── */

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiErr {
  ok: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiOk<T> | ApiErr;
