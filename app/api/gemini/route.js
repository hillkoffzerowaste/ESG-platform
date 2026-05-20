export async function POST(req) {
  try {
    const { message, context } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    if (!apiKey) {
      return Response.json(
        { error: "Missing GEMINI_API_KEY. Set it in your environment variables." },
        { status: 500 }
      );
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "คุณคือ AI Sustainability Assistant ของ Hillkoff ตอบภาษาไทย กระชับ เป็นมิตร และใช้ตัวเลขจาก context เท่านั้น ถ้าข้อมูลไม่พอให้บอกว่าต้องกรอกหรืออัปโหลดข้อมูลเพิ่ม อธิบาย ESG, Carbon Footprint, Scope 1/2/3 และ Zero Waste อย่างมืออาชีพ"
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `คำถาม: ${message}\n\nข้อมูล dashboard JSON:\n${JSON.stringify(context, null, 2)}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 700
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API error:", JSON.stringify(data, null, 2));
      return Response.json(
        { error: data?.error?.message || "Gemini request failed" },
        { status: response.status }
      );
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") ||
      "ขออภัยครับ ตอนนี้ยังสรุปคำตอบจาก Gemini ไม่ได้";

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
