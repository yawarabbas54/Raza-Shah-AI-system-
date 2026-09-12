export async function callModel(messages) {
  const base = process.env.AI_BASE_URL;
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!base || !key || !model) {
    return null; // demo mode
  }

  const response = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({ model, messages, temperature: 0.2 })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Model provider error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}
