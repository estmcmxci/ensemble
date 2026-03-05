import type {
  ApiResponse,
  ENSCheckResult,
  ENSProfile,
  ENSNameList,
} from '../types';

export class ENSembleClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  private async fetch<T>(
    path: string,
    options?: { method?: string; body?: unknown; timeoutMs?: number },
  ): Promise<T> {
    const { method = 'GET', body, timeoutMs = 8_000 } = options ?? {};
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {};
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    if (body) headers['Content-Type'] = 'application/json';

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      const json = (await res.json()) as ApiResponse<T>;
      if (!json.ok) throw new Error(json.error.message);
      return json.data;
    } finally {
      clearTimeout(timer);
    }
  }

  /* ── GET (public) endpoints ── */

  check(label: string, network: string, duration = '1y') {
    return this.fetch<ENSCheckResult>(
      `/check?label=${encodeURIComponent(label)}&network=${encodeURIComponent(network)}&duration=${encodeURIComponent(duration)}`,
    );
  }

  profile(input: string, network: string) {
    return this.fetch<ENSProfile>(
      `/profile?input=${encodeURIComponent(input)}&network=${encodeURIComponent(network)}`,
    );
  }

  list(address: string, network: string) {
    return this.fetch<ENSNameList>(
      `/list?address=${encodeURIComponent(address)}&network=${encodeURIComponent(network)}`,
    );
  }

  resolve(name: string, network: string) {
    return this.fetch<{ address: string; name: string }>(
      `/resolve?name=${encodeURIComponent(name)}&network=${encodeURIComponent(network)}`,
    );
  }

  verify(name: string, network: string) {
    return this.fetch<{ registered: boolean; name: string }>(
      `/verify?name=${encodeURIComponent(name)}&network=${encodeURIComponent(network)}`,
    );
  }

  /* ── POST (authenticated) endpoints ── */

  commit(name: string, owner: string, duration: string, network: string) {
    return this.fetch<{
      session_id: string;
      tx: { to: string; data: string; value?: string };
      wait_seconds: number;
      commitment: string;
      name: string;
      network: string;
    }>('/commit', {
      method: 'POST',
      body: { name, owner, duration, network },
    });
  }

  register(sessionId: string, network: string) {
    return this.fetch<{
      tx: { to: string; data: string; value: string };
      name: string;
      network: string;
    }>('/register', {
      method: 'POST',
      body: { session_id: sessionId, network },
    });
  }

  setRecords(name: string, records: Record<string, string>, network: string) {
    return this.fetch<{
      tx: { to: string; data: string };
    }>('/records', {
      method: 'POST',
      body: { name, records, network },
    });
  }

  renew(name: string, duration: string, network: string) {
    return this.fetch<{
      tx: { to: string; data: string; value: string };
    }>('/renew', {
      method: 'POST',
      body: { name, duration, network },
    });
  }

  transfer(name: string, to: string, network: string) {
    return this.fetch<{
      tx: { to: string; data: string };
    }>('/transfer', {
      method: 'POST',
      body: { name, to, network },
    });
  }

  setPrimary(name: string, network: string) {
    return this.fetch<{
      tx: { to: string; data: string };
    }>('/primary', {
      method: 'POST',
      body: { name, network },
    });
  }
}
