import { addUserCredits, deductUserCredits } from '../../ai/core/src/credits/server.js'
import { permissions } from '../../auth/src/rbac/permissions.js'

const fail = (status) => Object.assign(new Error(String(status)), { status })

/** The signed-in (or anonymous) user, from the session the request carries. */
export function enforceAuth(request, db) {
  const userId = request.headers.get('x-user-id')
  const user = userId && db.users.find((candidate) => candidate.id === userId)
  if (!user) throw fail(401)
  return user
}

/** Proves `user` may `permission` in `organizationId`; returns their membership. */
export function enforceOrganizationPermission(db, user, organizationId, permission) {
  const member = db.members.find((row) => row.organizationId === organizationId && row.userId === user.id)
  if (!member || !permissions[member.role].includes(permission)) throw fail(403)
  return member
}

/** Charges `amount` before `run`, refunding it when `run` fails to start. */
export async function deductCredits(db, user, amount, run) {
  if (!deductUserCredits(db, user.id, amount)) throw fail(422)
  try {
    return await run()
  } catch (error) {
    addUserCredits(db, user.id, amount)
    throw error
  }
}
