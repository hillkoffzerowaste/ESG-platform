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
          parts: [{
            text: [
              "คุณคือ AI Assistant ภาษาไทยของ Hillkoff Zero Waste Analytics",
              "ตอบให้ยืดหยุ่น เป็นธรรมชาติ และช่วยคิดต่อได้ทั้งเรื่องทั่วไป งานเอกสาร ธุรกิจ ESG Carbon Footprint Scope 1/2/3 Zero Waste Carbon Credit และ TCFD",
              "ถ้าผู้ใช้ถามข้อมูลตัวเลข dashboard ให้ใช้เฉพาะตัวเลขจาก context ห้ามเดา ถ้าข้อมูลไม่พอให้บอกว่าต้องกรอกหรืออัปโหลดข้อมูลเพิ่ม",
              "ถ้าคำถามกำกวม ให้สรุปสมมติฐานสั้นๆ แล้วให้คำตอบที่ใช้ได้ทันที",
              "ถ้า API หรือ context มีข้อจำกัด ให้ตอบด้วยทางเลือกปฏิบัติ ไม่ใช่ปฏิเสธสั้นๆ"
            ].join("\n")
          }]
        },
        contents: [{
          role: "user",
          parts: [{
            text: `คำถาม: ${message}\n\nข้อมูล dashboard JSON:\n${JSON.stringify(context, null, 2)}`
          }]
        }],
        generationConfig: {
          temperature: 0.65,
          topP: 0.9,
          maxOutputTokens: 1100
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
      "ขออภัยครับ ตอนนี้ยังสรุปคำตอบจาก AI ไม่ได้ ลองถามใหม่อีกครั้งหรือระบุข้อมูลเพิ่มได้ครับ";

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
