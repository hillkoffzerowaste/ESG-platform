export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  if (!apiKey) {
    return Response.json({
      ok: false,
      hasGeminiKey: false,
      model,
      error: "Missing GEMINI_API_KEY"
    }, { status: 500 });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "ตอบคำว่า ok เท่านั้น" }]
          }
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 10
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({
        ok: false,
        hasGeminiKey: true,
        model,
        status: response.status,
        error: data?.error?.message || "Gemini request failed"
      }, { status: response.status });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";

    return Response.json({
      ok: true,
      hasGeminiKey: true,
      model,
      status: response.status,
      reply: reply.trim()
    });
  } catch (error) {
    return Response.json({
      ok: false,
      hasGeminiKey: true,
      model,
      error: error.message || "Unexpected error"
    }, { status: 500 });
  }
}
