import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { txt, systemContext } = await request.json();

    // ดึงค่าผ่าน Environment Variable ของ Vercel (ปลอดภัยที่สุด คีย์ไม่รั่วไหล)
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyC97a8JLeMNFtQc7ikvACU4PJMDfF_o2nQ";
    
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemContext}\n\nคำถามจากผู้ใช้: ${txt}` }] }
      ],
    });

    const replyText = response.text || "ขออภัยครับ ระบบไม่สามารถดึงข้อมูลคำตอบได้";
    return NextResponse.json({ text: replyText });

  } catch (error) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
