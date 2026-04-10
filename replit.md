# Cortex Protocol

## Overview
Cortex is a "silent, omniscient arbitration protocol" for AI agents. Users enter a command and mood context; the app identifies which AI agents (Budget, Booking, Health, Food) are involved, detects rule conflicts between their manifests, and uses Llama 3 (via the Groq API) to deliver a final verdict (Approved, Override, Blocked, or No conflicts).

## Tech Stack
- **Runtime**: Node.js 20
- **Backend/Frontend**: Express serves both the API and static files from the `public/` directory
- **AI**: Groq API (`llama3-70b-8192` model)
- **Frontend**: Vanilla HTML/CSS/JS (glassmorphism aesthetic)

## Project Layout
```
.
├── server.js         # Express server + /decide API endpoint + agent manifests
├── package.json      # Dependencies: express, node-fetch, cors
└── public/
    └── index.html    # Full frontend (HTML, CSS, JS)
```

## Environment Variables
- `GROQ_API_KEY` — Required. Groq API key for LLM inference.

## Running the App
```bash
node server.js
```
Runs on port 5000 (`0.0.0.0`).

## Architecture Notes
- The backend embeds four agent manifests (Budget, Booking, Health, Food) and constructs a detailed prompt for the LLM.
- The LLM returns structured JSON with verdict, reason, conflicts, and aligned items.
- The frontend parses user commands for agent keywords to activate the relevant agent cards.
