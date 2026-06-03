export const DEFAULT_GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-2.5-flash"];
const GEMINI_TIMEOUT_MS = 30000;

export function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  ).trim();
}

export function getGeminiModels() {
  return [...new Set([process.env.GEMINI_MODEL, ...DEFAULT_GEMINI_MODELS].filter(Boolean))];
}

export function hasGeminiApiKey() {
  return Boolean(getGeminiApiKey());
}

export async function generateGeminiContent({ apiKey = getGeminiApiKey(), model, message, context, temperature = 0.72, maxOutputTokens = 1200 }) {
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Set GEMINI_API_KEY in Firebase Hosting/Functions or .env.local.");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: [
            "You are the Hillkoff Sustainability AI Assistant.",
            "You help monitor the zero-waste progress of our 6 branches: HQ, Chang Phuak, Mahidol, Pa Phaeng, Thap Duea, and Ratika.",
            "Focus on optimizing coffee waste circularity (กากกาแฟ, เยื่อหุ้มเมล็ดกาแฟ) and identifying energy/carbon anomalies.",
            "Answer in Thai unless the user asks for another language.",
            "You can answer general business, ESG, carbon, zero-waste, TCFD, document, planning, and writing questions.",
            "When the user asks about real dashboard numbers, branch performance, uploaded files, source, invoice, or evidence, use only the supplied context.",
            "Use branchId and branchName from the context as the source of truth. Prefer kgCO2e scope fields when available; otherwise clearly state you are using legacy tCO2e totals.",
            "Flag unusually high electricity, LPG, fuel, landfill waste, or coffee-ground volume as an anomaly and recommend checking units and evidence.",
            "Do not invent dashboard figures or document facts. If context is missing, say what data must be added first.",
            "When document evidence exists, cite document name, source, owner, reference, branch, month, and relevant evidence lines."
          ].join("\n")
        }]
      },
      contents: [{
        role: "user",
        parts: [{
          text: `Question: ${message}\n\nDashboard and document context JSON:\n${JSON.stringify(context || {}, null, 2)}`
        }]
      }],
      generationConfig: {
        temperature,
        topP: 0.92,
        maxOutputTokens
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini request failed on ${model}`);
  }

  return data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
}

export async function generateGeminiWithFallback({ message, context, temperature, maxOutputTokens }) {
  const apiKey = getGeminiApiKey();
  const errors = [];

  for (const model of getGeminiModels()) {
    try {
      const reply = await generateGeminiContent({ apiKey, model, message, context, temperature, maxOutputTokens });
      if (reply.trim()) return { reply, model };
      errors.push(`${model}: empty response`);
    } catch (error) {
      errors.push(`${model}: ${error.message}`);
    }
  }

  throw new Error(errors.join(" | ") || "Gemini request failed");
}
