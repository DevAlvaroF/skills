/** Stands in for the Stripe provider: what plan a reference (a user or an organization) is on. */
export const getPlan = (db, referenceId) => db.subscriptions.find((row) => row.referenceId === referenceId)?.plan ?? 'free'
