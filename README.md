# Yawar AI Agent — Complete Agentic Web System

A starter full-stack AI-agent system designed around:
- Autonomy & proactivity
- Progressive disclosure of skills
- Deterministic execution for critical operations
- Tool/API/browser/file integration points
- Product transparency, confidence and an action timeline

## Architecture

Browser UI → Node/Express API → Agent Orchestrator → Model Provider + Tools

The frontend is static and can be hosted on GitHub Pages, but **the backend must run on a server** if you use a real API key. Never put an AI API key in `public/`.

## Quick start

1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run:
   `npm install`
4. Copy `.env.example` to `.env`.
5. Add your model provider URL/key.
6. Run:
   `npm start`
7. Open:
   `http://localhost:3000`

## Provider

The server uses an OpenAI-compatible `/chat/completions` endpoint. It can be adapted to another provider by editing `server/model.js`.

For a no-key demo, leave the provider unset. The agent will run in DEMO mode so you can test the UI, planning, skills, tool execution, timeline and safety gates.

## Important

This project intentionally uses allowlisted tools. Critical actions require deterministic tool schemas and confirmation rather than letting the model invent arbitrary commands.

## Folder map

- `public/` — web interface
- `server/` — agent backend
- `skills/` — progressive-disclosure skill metadata + full instructions
- `data/` — local demo state
- `.env.example` — configuration
- `package.json` — dependencies/scripts
