# CORTEX Protocol

> *Your agents don't talk to each other. They answer to something higher.*

CORTEX is a silent arbitration layer that mediates between AI agents on behalf of the human. You define agents in plain English — CORTEX converts them into structured manifests and uses an LLM to detect conflicts, apply fairness, and deliver a verdict.

---

## What It Does

1. **Add agents** — describe any agent in plain English (e.g. *"Never spend more than £200, avoid subscriptions"*)
2. **CORTEX generates a manifest** — Groq + Llama 3.3 converts your description into a structured set of rules, goals, and limits
3. **Give CORTEX a command** — type what you want to do and your current mood
4. **Get a verdict** — CORTEX arbitrates between your agents and returns one of:
   - ✅ **Approved** — all agents aligned
   - ⚡ **Override** — human context overrides a rule
   - ❌ **Blocked** — a hard limit was hit
   - 💜 **No conflicts** — agents didn't clash

---

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 20 |
| Server | Express |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Frontend | Vanilla HTML/CSS/JS (glassmorphism) |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/cortex-protocol.git
cd cortex-protocol
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set your Groq API key

Create a `.env` file or set the environment variable:

```bash
export GROQ_API_KEY=your_groq_api_key_here
```

Get a free key at [console.groq.com](https://console.groq.com).

### 4. Run the app

```bash
node server.js
```

Then open [http://localhost:5000](http://localhost:5000).

---

## API Endpoints

### `POST /add-agent`
Converts a plain English description into an agent manifest.

**Request:**
```json
{ "description": "Never spend more than £200. Always look for discounts." }
```

**Response:**
```json
{
  "name": "Frugal Bot",
  "emoji": "💸",
  "summary": "Minimizes expenses",
  "rules": {
    "primary_goal": "cost minimization",
    "hard_limits": ["never exceed £200", "no subscriptions"],
    "soft_preferences": ["choose cheapest option"],
    "negotiation_weight": 0.7
  }
}
```

### `POST /decide`
Arbitrates a command against your active agents.

**Request:**
```json
{
  "command": "Book a flight to Madrid",
  "mood": "normal day",
  "agents": [ ...array of agent manifests... ]
}
```

**Response:**
```json
{
  "tag": "Override",
  "verdict": "Book the flight but stay within budget limits.",
  "reason": "The booking agent wants the best flight at any price, but the budget agent sets a hard ceiling...",
  "conflicts": ["budget vs booking on price"],
  "aligned": ["health: no early flights"],
  "agentsInvolved": ["Frugal Bot", "Booking Agent"]
}
```

---

## Project Structure

```
cortex-protocol/
├── server.js          # Express server + Groq integration + API endpoints
├── package.json       # Dependencies
└── public/
    └── index.html     # Full frontend (HTML, CSS, JS)
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Your Groq API key for LLM inference |

---

## License

MIT
