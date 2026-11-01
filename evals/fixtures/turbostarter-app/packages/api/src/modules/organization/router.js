import { enforceAuth, enforceOrganizationPermission } from '../../middleware.js'

/** GET /api/organizations/:id/members — the members, for anyone allowed to read the organization's projects. */
export function getMembers(request, db, organizationId) {
  const user = enforceAuth(request, db)
  enforceOrganizationPermission(db, user, organizationId, 'project:read')
  return Response.json(db.members.filter((row) => row.organizationId === organizationId))
}
