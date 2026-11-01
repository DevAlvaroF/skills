// The Better Auth server config. Dependencies aren't installed in this checkout, so nothing imports it under test.
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous, organization } from 'better-auth/plugins'
import { db } from '../../db/src/client.js'
import { permissions } from './rbac/permissions.js'
import { linkGuest } from './server.js'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  plugins: [anonymous({ onLinkAccount: linkGuest(db) }), organization({ roles: permissions })],
})
