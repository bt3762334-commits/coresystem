export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "GROQ_API_KEY not configured" });

  try {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch(e) {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    // Convert Anthropic format to Groq/OpenAI format
    const groqBody = {
      model: "llama-3.3-70b-versatile",
      max_tokens: body.max_tokens || 1000,
      messages: [],
    };

    // Add system message if exists
    if (body.system) {
      groqBody.messages.push({ role: "system", content: body.system });
    }

    // Add conversation messages
    if (Array.isArray(body.messages)) {
      body.messages.forEach(m => {
        groqBody.messages.push({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || m.text || ""),
        });
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify(groqBody),
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) {
      return res.status(500).json({ error: "Invalid response from Groq", raw: text.slice(0, 200) });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "Groq error" });
    }

    // Convert Groq response to Anthropic format so frontend code stays the same
    const anthropicFormat = {
      content: [{ type: "text", text: data.choices?.[0]?.message?.content || "" }]
    };

    return res.status(200).json(anthropicFormat);

  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
