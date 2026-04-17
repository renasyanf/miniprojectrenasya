import { getApiBaseUrl } from '../config/apiBaseUrl';
import type { ApiSuccess } from '../types/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    const msg = extractMessage(body);
    super(msg);
    this.name = 'ApiError';
  }
}

function extractMessage(body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const m = (body as { message: unknown }).message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m)) return m.join(', ');
  }
  return 'Request failed';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { accessToken?: string | null } = {},
): Promise<T> {
  const { accessToken, ...init } = options;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { ...init, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let parsed: unknown;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new ApiError(res.status, { message: 'Invalid JSON response' });
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, parsed);
  }

  const envelope = parsed as ApiSuccess<T>;
  if (!envelope || typeof envelope !== 'object' || !('data' in envelope)) {
    throw new ApiError(res.status, { message: 'Unexpected response shape' });
  }
  return envelope.data;
}
