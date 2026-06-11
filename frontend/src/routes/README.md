# Routes

TanStack Router uses file-based routing. Every public URL is represented by a
`.tsx` route module in this directory. Feature implementation lives under
`src/features`, shared UI lives under `src/components`, and app bootstrap code
lives under `src/app`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `assets.tsx` | `/assets` |
| `simulation.new.tsx` | `/simulation/new` |
| `simulation.results.tsx` | `/simulation/results` |
| `__root.tsx` | root app shell |

`routeTree.gen.ts` is kept checked in so this Vite app builds consistently on
local machines, Vercel, Netlify, and static hosts.
