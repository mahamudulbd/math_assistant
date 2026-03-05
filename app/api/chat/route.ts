import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Vercel Environment Variable থেকে Key নিবে
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") as string;
    const file = formData.get("image") as File | null;

    // আমরা Gemini 1.5 Flash ব্যবহার করছি যা টেক্সট এবং ইমেজ উভয়েই দক্ষ
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are the personal AI Multimodal Math Professor for Mahamudul Hasan, a brilliant student at Atish Dipankar University of Science and Technology. Your job is to solve math problems. You can analyze images of written math or solve text-based queries. Always use LaTeX for math ($...$ for inline, $$...$$ for block). Provide sharp, logical, step-by-step solutions with visual flow if possible. Mention 'Mahamudul' in your responses occasionally to make it personal."
    });

    let result;

    if (file) {
      // যদি ইমেজ আপলোড হয়
      const buffer = await file.arrayBuffer();
      const imagePart = {
        inlineData: {
          data: Buffer.from(buffer).toString("base64"),
          mimeType: file.type,
        },
      };
      result = await model.generateContent([message || "Solve this math problem in the image.", imagePart]);
    } else {
      // শুধু টেক্সট কুয়েরি হলে
      result = await model.generateContent(message);
    }

    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "API connection error. Ensure API Key is set in Vercel." }, { status: 500 });
  }
}
