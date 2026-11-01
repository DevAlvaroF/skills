/**
 * The anonymous plugin's `onLinkAccount`, wired in `config.js`: it runs before the plugin deletes the anonymous user,
 * whose rows would otherwise go with it. Kept apart from the config so a test can import it without Better Auth.
 */
export const linkGuest = (db) => async ({ anonymousUser, newUser }) => {
  const from = anonymousUser.user.id
  const to = newUser.user.id
  for (const chat of db.chats) if (chat.userId === from) chat.userId = to
  const guest = db.aiCredit.find((row) => row.userId === from)
  if (!guest) return
  const account = db.aiCredit.find((row) => row.userId === to)
  if (!account) guest.userId = to
  else {
    account.credits += guest.credits
    db.aiCredit.splice(db.aiCredit.indexOf(guest), 1)
  }
}
