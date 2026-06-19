const Anthropic = require('@anthropic-ai/sdk');
const { asyncHandler } = require('../middleware/errorHandler');
const { SYSTEM_PROMPT, ruleReply } = require('../utils/parkeaseKnowledge');

let client = null;
const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
};

// Keep the conversation tidy: only user/assistant string turns, last 10, and it
// must start with a user message (Anthropic requirement).
const sanitize = (messages) => {
  let safe = (Array.isArray(messages) ? messages : [])
    .filter((m) => ['user', 'assistant'].includes(m?.role) && typeof m?.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-10);
  while (safe.length && safe[0].role !== 'user') safe.shift();
  return safe;
};

// @route   POST /api/chat   { messages: [{ role, content }] }
const chat = asyncHandler(async (req, res) => {
  const messages = sanitize(req.body.messages);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    res.status(400);
    throw new Error('A user message is required');
  }
  const lastUser = messages[messages.length - 1].content;

  const anthropic = getClient();
  if (!anthropic) {
    // No API key — rule-based fallback keeps the assistant working out of the box
    return res.json({ success: true, reply: ruleReply(lastUser), source: 'rules' });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages,
      output_config: { effort: 'low' }, // snappy, low-cost for simple Q&A
    });
    const reply = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();
    res.json({ success: true, reply: reply || ruleReply(lastUser), source: 'claude' });
  } catch (err) {
    // Bad key, rate limit, outage — degrade gracefully to the rule-based reply
    console.error('Chat (Claude) error:', err.message);
    res.json({ success: true, reply: ruleReply(lastUser), source: 'rules' });
  }
});

module.exports = { chat };
