const OPENAI_URL = "https://api.openai.com/v1/responses";

function readJson(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }

  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item.type === "message" && Array.isArray(item.content)) {
        const textParts = item.content
          .map((part) => part.text || part.value || "")
          .filter(Boolean);
        if (textParts.length) {
          return textParts.join("").trim();
        }
      }
    }
  }

  return "";
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.statusCode = 501;
    res.end(JSON.stringify({ error: "OPENAI_API_KEY not configured" }));
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch (error) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  const message = String(body.message || "").trim();
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Message is required" }));
    return;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1";
  const instructions =
    "Ты вежливый помощник для школьного проекта. Отвечай кратко и понятно.";

  const input = history.map((item) => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: String(item.content || ""),
  }));

  const payload = {
    model,
    instructions,
    input,
  };

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage =
        (data.error && data.error.message) || "OpenAI API error";
      res.statusCode = response.status;
      res.end(JSON.stringify({ error: errorMessage }));
      return;
    }

    const reply = extractOutputText(data) || "";
    res.statusCode = 200;
    res.end(JSON.stringify({ reply }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Server error" }));
  }
};
