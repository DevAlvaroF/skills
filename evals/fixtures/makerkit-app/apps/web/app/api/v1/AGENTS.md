# /api/v1

The API the mobile app calls, with the user's bearer token. Installed mobile builds keep calling it until each user
updates, so its contract is additive only:

- A response only gains fields. Never remove, rename or retype one: phones already in people's hands would break.
- A breaking change is a new version (`/api/v2`), never an edit here.
- Each handler calls a service from `lib/server/`; no business logic in the handler.
- Each handler's response shape is tested through its exported `GET`/`POST` in `apps/web/test/`.
