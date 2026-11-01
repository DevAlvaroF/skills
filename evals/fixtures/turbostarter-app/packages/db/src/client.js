// The Drizzle client over the schema. Dependencies aren't installed in this checkout, so nothing imports it under test.
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema/index.js'

export const db = drizzle(process.env.DATABASE_URL, { schema })
