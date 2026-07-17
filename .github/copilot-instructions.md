---
applyTo: "**"
---

# Project Rules

- NEVER read, edit, modify, or display the contents of `.env`. It contains secrets. The user maintains `.env` themselves.
- Only ever create or update `.env.example` when environment variables change.
- Use `.env.example` to understand or document environment variables.
- When the user asks about env vars, reference `.env.example` only.
