const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function callGroq(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 600
    })
  });
  const data = await response.json();
  if (!response.ok || !data.choices || !data.choices[0]) {
    console.error('Groq API error:', JSON.stringify(data));
    throw new Error(data.error?.message || 'Unexpected response from Groq');
  }
  return data.choices[0].message.content;
}

app.post('/add-agent', async (req, res) => {
  const { description } = req.body;
  const prompt = `
You are CORTEX. A user wants to add an AI agent to your protocol.
They described it in plain English. Convert it into a structured agent manifest.

User description: "${description}"

Respond in this EXACT JSON format only, no other text:
{
  "name": "short agent name (2-3 words max)",
  "emoji": "one relevant emoji",
  "summary": "one short line describing what it does",
  "rules": {
    "primary_goal": "what this agent optimises for",
    "hard_limits": ["list", "of", "strict", "rules"],
    "soft_preferences": ["list", "of", "preferred", "behaviours"],
    "negotiation_weight": 0.7
  }
}
`;
  try {
    const text = await callGroq(prompt);
    const clean = text.replace(/```json|```/g, '').trim();
    const manifest = JSON.parse(clean);
    res.json(manifest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not parse agent description' });
  }
});

app.post('/decide', async (req, res) => {
  const { command, mood, agents } = req.body;
  if (!agents || agents.length === 0) {
    return res.json({
      tag: 'No agents',
      verdict: 'Add at least one agent first.',
      reason: 'CORTEX has no agents to arbitrate between. Add your agents using the + button.',
      conflicts: [],
      aligned: [],
      agentsInvolved: []
    });
  }
  const manifestText = agents.map(a => `${a.name}: ${JSON.stringify(a.rules)}`).join('\n');
  const prompt = `
You are CORTEX — a silent, omniscient arbitration protocol for AI agents.
You have read the soul (manifest) of every agent. You make decisions on behalf of the human without the agents ever knowing.

AGENT MANIFESTS:
${manifestText}

HUMAN CONTEXT:
- Command: "${command}"
- Mood/Day: "${mood}"

YOUR JOB:
1. Identify which agents are involved
2. Detect any conflicts between their rules
3. Apply human fairness — not robot logic
4. Make a verdict that serves the human, not the agents

RESPOND IN THIS EXACT JSON FORMAT:
{
  "tag": "one of: Approved / Override / Blocked / No conflicts",
  "verdict": "one clear sentence — the decision",
  "reason": "2-3 sentences explaining the reasoning like Jarvis would",
  "conflicts": ["list of conflicts detected"],
  "aligned": ["list of things that passed without conflict"],
  "agentsInvolved": ["list of agent names involved"]
}

Only respond with the JSON. No other text.
`;
  try {
    const text = await callGroq(prompt);
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'CORTEX brain failed to respond' });
  }
});

app.listen(5000, '0.0.0.0', () => console.log('CORTEX running on port 5000'));
