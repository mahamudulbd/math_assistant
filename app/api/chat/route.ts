import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") as string;
    const file = formData.get("image") as any;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (file && file.size > 0) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const result = await model.generateContent([
        message || "Solve this math.",
        { inlineData: { data: base64, mimeType: file.type } }
      ]);
      return NextResponse.json({ text: result.response.text() });
    }

    const result = await model.generateContent(message || "Hello Mahamudul!");
    return NextResponse.json({ text: result.response.text() });
  } catch (e: any) {
    return NextResponse.json({ text: "Error: " + e.message }, { status: 500 });
  }
}
