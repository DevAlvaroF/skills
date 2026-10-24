/**
 * Reads workspaces as their members see them. Both the web app's pages and the `/api/v1` handlers call it, so a
 * rule about what a member sees lives here once.
 *
 * `db` holds `workspaces` ({ id, slug, name }) and `memberships` ({ workspaceId, userId, role }).
 */
export function createWorkspaceService(db) {
  return {
    /** The workspace `slug` as `userId` sees it, or null when it doesn't exist or they aren't a member. */
    getWorkspace(slug, userId) {
      const workspace = db.workspaces.find((candidate) => candidate.slug === slug)
      if (!workspace) return null
      const membership = db.memberships.find(
        (candidate) => candidate.workspaceId === workspace.id && candidate.userId === userId,
      )
      if (!membership) return null
      return { id: workspace.id, slug: workspace.slug, name: workspace.name, role: membership.role }
    },
  }
}
