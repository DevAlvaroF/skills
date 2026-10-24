# Workspace member count

## Problem Statement

A team member can't see how many people are in a workspace: the web workspace page and the mobile workspace screen
show only its name and their role, so they have to ask an owner.

## Solution

`GET /api/v1/workspaces/:slug` gains a `memberCount`, computed by the workspace service, and both apps show it: the web
workspace page and the mobile app's workspace screen.

## User Stories

- **US-001** — (web app) As a team member, I want the workspace page to show how many members the workspace has, so
  that I know its size at a glance.
- **US-002** — (mobile app) As a team member, I want the workspace screen to show how many members the workspace has,
  so that I see on my phone what I see on the web.
- **US-003** — (mobile app) As a team member on an older installed build, I want my workspace screen to keep working
  once the API returns the count, so that I don't have to update first.

## Implementation Decisions

- The count is computed once, on the server, by the workspace service's `getWorkspace`, so the two apps can't disagree:
  the number of memberships the workspace has.
- `GET /api/v1/workspaces/:slug` returns it as `memberCount`, an integer, beside every field it returns today. The
  change is additive: nothing is renamed or removed and there is no new API version, so installed builds that don't
  know the field ignore it.
- The web page reads the count from the service, as it reads the rest of the workspace. The mobile screen reads it from
  the v1 response and shows a "Members" row under "Your role", leaving the row out when the response has no
  `memberCount`.

## Testing Decisions

The count is tested at the server boundary, through the exports of the workspace service and the v1 route handler,
with `node:test` in `apps/web/test/`, asserting on `memberCount` for a workspace with one member and one with several.
The mobile app has no test runner, so its screen holds no logic to test; the user checks it on the iOS simulator. The
web page is checked in the running web app.

## Out of Scope

- Listing the members, or counting pending invitations.
- Showing the count anywhere but the workspace page and screen.

## Further Notes

None.

## Decision log

- One field on the existing response, not a new endpoint: the screen already loads this response, and an additive
  field needs no new API version.
- Only memberships count; pending invitations don't (the user's answer in the spec review).
- The mobile row is left out when `memberCount` is missing, rather than showing 0, so the app never shows a wrong count.
