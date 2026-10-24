import { database } from '../../../../../lib/server/database.js'
import { createWorkspaceService } from '../../../../../lib/server/workspace.service.js'

/**
 * GET /api/v1/workspaces/:slug — the workspace as the signed-in member sees it. In the kit this is wrapped in
 * `enhanceRouteHandler`, which resolves the bearer token to a user; here the user arrives as `x-user-id`.
 */
export async function GET(request, { params }, db = database) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const { slug } = await params
  const workspace = createWorkspaceService(db).getWorkspace(slug, userId)
  if (!workspace) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(workspace)
}
