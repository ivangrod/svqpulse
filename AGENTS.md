<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Useful commands

```bash
npm prep          # lint + build + test
docker compose up # start database
npm run dev       # local dev server (not Docker)
npm run lint:fix
npm run test
```

# Architecture

- Next.js 16, Onion Architecture, DDD.
- Paths:
  - API routes `src/app/api/`.
  - Frontend `src/app/`
  - Backend `src/contexts/`.

# Documentation

- Detailed conventions with examples live in `docs/`.
- When working on a task, use this map to find and read **only** the docs relevant to your task:

```
docs/
├── code-style.md
├── documentation-format.md
├── backend/
│   ├── api-routes-reflect-metadata.md
│   ├── dependency-injection-diod.md
│   ├── hexagonal-architecture.md
│   └── thin-api-routes.md
├── database/
│   ├── creating-new-tables.md
│   ├── not-null-fields.md
│   ├── table-naming-singular-plural-convention.md
│   └── text-over-varchar-char-convention.md
└── testing/
    ├── mock-objects.md
    └── object-mothers.md
```
