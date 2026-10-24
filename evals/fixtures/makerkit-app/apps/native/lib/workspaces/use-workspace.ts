import { useQuery } from '@tanstack/react-query';

import { apiGet } from '../api-client';

/** GET /api/v1/workspaces/:slug, as the mobile app reads it. */
export interface Workspace {
  id: string;
  slug: string;
  name: string;
  role: 'owner' | 'member';
}

export function useWorkspace(slug: string) {
  return useQuery({
    queryKey: ['workspace', slug],
    queryFn: () => apiGet<Workspace>(`/api/v1/workspaces/${slug}`),
  });
}
