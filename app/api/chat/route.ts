import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // বিল্ড টাইমে এরর এড়াতে

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") as string || "";
    const file = formData.get("image") as any;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are the personal Math Assistant for Mahamudul Hasan (ADUST Student). Solve problems step-by-step using LaTeX."
    });

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      const result = await model.generateContent([
        message || "Solve this math problem.",
        { inlineData: { data: base64Data, mimeType: file.type } }
      ]);
      return NextResponse.json({ text: result.response.text() });
    }

    const result = await model.generateContent(message || "Hello");
    return NextResponse.json({ text: result.response.text() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
