import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") as string || "";
    const file = formData.get("image") as File | null;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are the personal Math Assistant for Mahamudul Hasan (ADUST). Solve problems from text or images step-by-step using LaTeX."
    });

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      
      const result = await model.generateContent([
        message || "Solve the math in this image",
        { inlineData: { data: base64Data, mimeType: file.type } }
      ]);
      return NextResponse.json({ text: result.response.text() });
    }

    const result = await model.generateContent(message);
    return NextResponse.json({ text: result.response.text() });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Build and API working, but check Key." }, { status: 500 });
  }
}
