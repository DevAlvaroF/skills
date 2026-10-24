/** Stands in for the Supabase client in this checkout: the rows the services read. */
export const database = {
  workspaces: [{ id: 'w1', slug: 'acme', name: 'Acme' }],
  memberships: [
    { workspaceId: 'w1', userId: 'u1', role: 'owner' },
    { workspaceId: 'w1', userId: 'u2', role: 'member' },
  ],
}
