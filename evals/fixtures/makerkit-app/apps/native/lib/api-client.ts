import { getAccessToken } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/** GETs a `/api/v1` path with the signed-in user's bearer token. */
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${await getAccessToken()}` },
  });
  if (!response.ok) throw new Error(`GET ${path}: ${response.status}`);
  return (await response.json()) as T;
}
