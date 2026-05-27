const DEFAULT_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash"];

function uniqueModels() {
  return [...new Set([process.env.GEMINI_MODEL, ...DEFAULT_MODELS].filter(Boolean))];
}

async function askGemini({ apiKey, model, message, context }) {
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
            "You can answer questions from uploaded document evidence in context.documents. When a question asks about source, origin, invoice, file, or evidence, cite the document name, source, owner, reference, branch, month, and relevant evidence lines. Do not invent document facts that are not in context.",
            "คุณคือ AI Assistant ภาษาไทยของ Hillkoff Zero Waste Analytics",
            "ตอบได้ทั้งเรื่องทั่วไป งานเอกสาร การคิดไอเดีย การสรุป การเขียนข้อความ ธุรกิจ และเรื่อง ESG/Carbon/Zero Waste/TCFD",
            "ถ้าคำถามเป็นเรื่องทั่วไป ให้ตอบตรงคำถามตามความรู้ทั่วไป ไม่ต้องผูกกับ dashboard",
            "ถ้าผู้ใช้ถามตัวเลขจริงของ dashboard ให้ใช้เฉพาะตัวเลขจาก context ห้ามเดาตัวเลขเอง",
            "ถ้าข้อมูลไม่พอ ให้บอกว่าข้อมูลส่วนไหนยังขาด และเสนอวิธีเก็บข้อมูลต่อ",
            "ตอบเป็นภาษาไทย กระชับ ช่วยต่อยอดได้ และหลีกเลี่ยงคำตอบแข็งๆ แบบปฏิเสธ"
          ].join("\n")
        }]
      },
      contents: [{
        role: "user",
        parts: [{
          text: `คำถาม: ${message}\n\nข้อมูล dashboard JSON สำหรับคำถามเชิงข้อมูลเท่านั้น:\n${JSON.stringify(context, null, 2)}`
        }]
      }],
      generationConfig: {
        temperature: 0.72,
        topP: 0.92,
        maxOutputTokens: 1200
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini request failed on ${model}`);
  }

  return data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
}

export async function POST(req) {
  try {
    const { message, context } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Missing GEMINI_API_KEY. Set it in your environment variables." },
        { status: 500 }
      );
    }

    const errors = [];
    for (const model of uniqueModels()) {
      try {
        const reply = await askGemini({ apiKey, model, message, context });
        if (reply.trim()) return Response.json({ reply, model });
      } catch (error) {
        errors.push(`${model}: ${error.message}`);
      }
    }

    return Response.json(
      { error: errors.join(" | ") || "Gemini request failed" },
      { status: 502 }
    );
  } catch (error) {
    return Response.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
