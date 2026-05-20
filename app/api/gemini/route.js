export async function POST(req) {
  try {
    const { message, context } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY. Set it in terminal before running npm run dev." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions:
          "คุณคือ AI Sustainability Assistant ของ Hillkoff ตอบภาษาไทย กระชับ เป็นมิตร และใช้ตัวเลขจาก context เท่านั้น ถ้าข้อมูลไม่พอให้บอกว่าต้องกรอกหรืออัปโหลดข้อมูลเพิ่ม อธิบาย ESG, Carbon Footprint, Scope 1/2/3 และ Zero Waste อย่างมืออาชีพ",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `คำถาม: ${message}\n\nข้อมูล dashboard JSON:\n${JSON.stringify(context, null, 2)}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: data?.error?.message || "OpenAI request failed" },
        { status: response.status }
      );
    }

    const reply =
      data.output_text ||
      data.output?.flatMap(item => item.content || []).map(part => part.text || "").join("") ||
      "ขออภัยครับ ตอนนี้ยังสรุปคำตอบจาก AI ไม่ได้";

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
