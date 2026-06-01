import { generateGeminiWithFallback, getGeminiModels, hasGeminiApiKey } from "@/lib/gemini";

export async function GET() {
  const models = getGeminiModels();

  if (!hasGeminiApiKey()) {
    return Response.json({
      ok: false,
      hasGeminiKey: false,
      models,
      error: "Missing GEMINI_API_KEY"
    }, { status: 500 });
  }

  try {
    const result = await generateGeminiWithFallback({
      message: "ตอบคำว่า ok เท่านั้น",
      context: {},
      temperature: 0,
      maxOutputTokens: 10
    });

    return Response.json({
      ok: true,
      hasGeminiKey: true,
      model: result.model,
      models,
      reply: result.reply.trim()
    });
  } catch (error) {
    return Response.json({
      ok: false,
      hasGeminiKey: true,
      models,
      error: error.message || "Unexpected error"
    }, { status: 500 });
  }
}
