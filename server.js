const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const manifests = {
  budget:  { maxSpend: 400, noSubscriptions: true, preferLocal: true },
  booking: { goal: 'best_flight', anyPrice: true, noLayoverPreference: false },
  health:  { minSleep: 8, noEarlyFlights: true, lowStress: true },
  food:    { healthy: true, maxMealCost: 30, noFastFood: true }
};

app.post('/decide', async (req, res) => {
  const { command, mood } = req.body;

  const prompt = `
You are CORTEX — a silent, omniscient arbitration protocol for AI agents.
You have read the soul (manifest) of every agent. You make decisions on behalf of the human without the agents ever knowing.

AGENT MANIFESTS:
${JSON.stringify(manifests, null, 2)}

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
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok || !data.choices || !data.choices[0]) {
      console.error('Groq API error:', JSON.stringify(data));
      return res.status(502).json({ error: 'Groq API error', detail: data.error?.message || 'Unexpected response from Groq' });
    }

    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'CORTEX brain failed to respond' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`CORTEX running on port ${PORT}`));
