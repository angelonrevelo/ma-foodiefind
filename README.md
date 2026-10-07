![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc&logoColor=white)
![MySQL](https://img.shields.io/badge/Drizzle-MySQL-4479A1?logo=mysql&logoColor=white)
![license](https://img.shields.io/badge/license-MIT%20(package.json)-green)
![status](https://img.shields.io/badge/status-prototype-orange)

# Foodie Find

**Pick a place to eat as a group: everyone shares where they are and what they crave, and it finds restaurants in the middle.**

Deciding where a group should eat usually means a long chat thread. Foodie
Find turns it into a room:

- **Make a room** and share its code; friends join with the code.
- **Everyone adds their location and craving.**
- **Search** — the app works out the midpoint of everyone's locations and asks
  Google Places for restaurants, cafes and bars within a radius of it.
- **Results** come back as a list and on a map.

There is also a solo mode on the home page for searching on your own.

> **Prototype.** Built on a Manus app template (its OAuth login and "Forge"
> API helpers are still wired in). Filtering by Grab / Foodpanda delivery is
> shown on the home page but not implemented in the search yet — see
> [`todo.md`](todo.md).

## Quick start

Needs Node, pnpm and a MySQL database.

```bash
pnpm install
cp your-env-file .env   # see Configuration — there is no .env.example
pnpm db:push            # generate + run Drizzle migrations
pnpm dev                # Express + Vite on PORT (default 3000, next free port if taken)
```

Other scripts:

```bash
pnpm build     # Vite client build + bundled server into dist/
pnpm start     # run the production build
pnpm check     # TypeScript, no emit
pnpm test      # vitest
pnpm format    # prettier
```

## Configuration

Server:

| Key | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL connection string (also required by `drizzle-kit`) |
| `GOOGLE_MAPS_API_KEY` | Google Places API (Nearby Search) |
| `JWT_SECRET` | Signs the session cookie |
| `OAUTH_SERVER_URL` | Manus OAuth server |
| `OWNER_OPEN_ID` | Open ID of the app owner |
| `VITE_APP_ID` | App id, also read on the server |
| `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY` | Manus Forge API (server side) |
| `PORT` | Preferred port, default 3000 |

Client (Vite):

| Key | Purpose |
| --- | --- |
| `VITE_APP_TITLE` / `VITE_APP_LOGO` | App name and logo |
| `VITE_OAUTH_PORTAL_URL` | Login portal URL |
| `VITE_FRONTEND_FORGE_API_URL` / `VITE_FRONTEND_FORGE_API_KEY` | Manus Forge API (client side) |

## How it works

```
room members ─► locations + cravings (MySQL via Drizzle)
                        │
                 centroid of locations
                        │
       Google Places Nearby Search (restaurant, cafe, bar; radius)
                        │
              saved search results ─► list + map
```

| Path | What it is |
| --- | --- |
| `client/` | React app (wouter routes: `/`, `/room/create`, `/room/join`, `/room/:id`, `/room/:id/results`) |
| `server/` | Express + tRPC; `routers/rooms.ts`, `routers/search.ts`, `utils/googleMaps.ts` |
| `drizzle/` | Schema and migrations |
| `shared/` | Code shared by client and server |

## Docs

- [`todo.md`](todo.md) — feature checklist
- [`RESEARCH_FINDINGS.md`](RESEARCH_FINDINGS.md) — notes on the Google Places API
