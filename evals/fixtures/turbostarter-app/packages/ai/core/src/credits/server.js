/** Deducts `amount` credits from `userId`'s ledger row; false when the balance is short. */
export function deductUserCredits(db, userId, amount) {
  const row = db.aiCredit.find((candidate) => candidate.userId === userId)
  if (!row || row.credits < amount) return false
  row.credits -= amount
  return true
}

export function addUserCredits(db, userId, amount) {
  const row = db.aiCredit.find((candidate) => candidate.userId === userId)
  if (row) row.credits += amount
}
