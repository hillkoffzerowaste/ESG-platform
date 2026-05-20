export async function POST(req) {
  try {
    const { message, context } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY. Set it in terminal before running npm run dev." },
        { error: "Missing GEMINI_API_KEY. Set it in terminal before running npm run dev." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions:
          "คุณคือ AI Sustainability Assistant ของ Hillkoff ตอบภาษาไทย กระชับ เป็นมิตร และใช้ตัวเลขจาก context เท่านั้น ถ้าข้อมูลไม่พอให้บอกว่าต้องกรอกหรืออัปโหลดข้อมูลเพิ่ม อธิบาย ESG, Carbon Footprint, Scope 1/2/3 และ Zero Waste อย่างมืออาชีพ",
        input: [
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
            content: [
            parts: [
              {
                type: "input_text",
                text: `คำถาม: ${message}\n\nข้อมูล dashboard JSON:\n${JSON.stringify(context, null, 2)}`
              }
            ]
          }
        ]
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 700
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: data?.error?.message || "OpenAI request failed" },
        { error: data?.error?.message || "Gemini request failed" },
        { status: response.status }
      );
    }

    const reply =
      data.output_text ||
      data.output?.flatMap(item => item.content || []).map(part => part.text || "").join("") ||
      "ขออภัยครับ ตอนนี้ยังสรุปคำตอบจาก AI ไม่ได้";
      data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") ||
      "ขออภัยครับ ตอนนี้ยังสรุปคำตอบจาก Gemini ไม่ได้";

    return Response.json({ reply });
  } catch (error) {
