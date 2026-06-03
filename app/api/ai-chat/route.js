import { generateGeminiWithFallback, hasGeminiApiKey } from "@/lib/gemini";
import { HILLKOFF_BRANCHES } from "@/lib/esgMasterData";

export async function POST(req) {
  try {
    const { message, context } = await req.json();

    if (!hasGeminiApiKey()) {
      return Response.json(
        { error: "Missing GEMINI_API_KEY. Set it in Firebase environment variables." },
        { status: 500 }
      );
    }

    const result = await generateGeminiWithFallback({
      message,
      context: {
        masterBranches: HILLKOFF_BRANCHES,
        ...(context || {})
      }
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
