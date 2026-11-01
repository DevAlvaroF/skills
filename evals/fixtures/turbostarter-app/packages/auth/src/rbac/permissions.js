/** Organization roles and what each may do. The only place roles are defined. */
export const permissions = {
  owner: ['project:read', 'project:write', 'billing:manage'],
  admin: ['project:read', 'project:write'],
  member: ['project:read'],
}
