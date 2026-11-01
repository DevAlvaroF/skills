import { deductCredits, enforceAuth } from '../../middleware.js'

/** POST /api/ai/chat — one model reply, paid for with credits. `model` stands in for the AI SDK call. */
export async function postChat(request, db, model) {
  const user = enforceAuth(request, db)
  const { prompt } = await request.json()
  const reply = await deductCredits(db, user, 1, () => model(prompt))
  return Response.json({ reply })
}
