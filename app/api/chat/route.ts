import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") as string;
    const file = formData.get("image") as File | null;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are the personal AI Math Professor for Mahamudul Hasan (ADUST Student). Solve math problems from text or images. Use LaTeX ($...$ and $$...$$). Be professional and fast."
    });

    let result;
    if (file) {
      const buffer = await file.arrayBuffer();
      const imagePart = {
        inlineData: { data: Buffer.from(buffer).toString("base64"), mimeType: file.type },
      };
      result = await model.generateContent([message || "Solve this math.", imagePart]);
    } else {
      result = await model.generateContent(message);
    }

    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
