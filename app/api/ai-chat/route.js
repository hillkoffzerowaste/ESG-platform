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
                "คุณคือ AI Assistant ภาษาไทยของ Hillkoff ตอบคำถามทั่วไปได้ทุกเรื่องอย่างกระชับ เป็นมิตร และเป็นประโยชน์ เช่น ความรู้ทั่วไป งานเอกสาร การวางแผน ไอเดียธุรกิจ การเขียนข้อความ รวมถึง ESG, Carbon Footprint, Scope 1/2/3, Zero Waste, Carbon Credit และ TCFD ถ้าผู้ใช้ถามสรุปตัวเลขจริงของ dashboard หรือข้อมูลรายสาขา ให้ใช้ตัวเลขจาก context เท่านั้น ห้ามแต่งตัวเลขเอง ถ้า context ยังไม่มีข้อมูล ให้บอกว่าต้องกรอกหรืออัปโหลดข้อมูลเพิ่มก่อน"
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
