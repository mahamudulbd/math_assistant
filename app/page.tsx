"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';
import { Send, BrainCircuit, Camera, Mic, X, Zap } from "lucide-react";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const scrollRef = useRef<any>(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const handleSend = async () => {
    if (!input && !imageFile) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: input, img: preview }]);

    const fd = new FormData();
    fd.append("message", input);
    if (imageFile) fd.append("image", imageFile);

    try {
      const res = await fetch("/api/chat", { method: "POST", body: fd });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", content: data.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "bot", content: "Error! Try again." }]);
    }
    setLoading(false); setInput(""); setPreview(null); setImageFile(null);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white">
      <main className="flex-1 flex flex-col max-w-5xl mx-auto border-x border-slate-800">
        <header className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl"><BrainCircuit className="text-blue-500" /> MathPro AI</div>
          <div className="text-xs text-slate-500 font-mono">Personal: Mahamudul Hasan</div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-blue-600' : 'bg-slate-900 border border-slate-800'}`}>
                {m.img && <img src={m.img} className="w-48 rounded mb-2" alt="Uploaded" />}
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && <Zap className="animate-spin text-blue-500 mx-auto" />}
        </div>

        <footer className="p-4 bg-slate-900/50 border-t border-slate-800">
          {preview && (
            <div className="relative inline-block mb-2">
              <img src={preview} className="w-20 h-20 rounded border-2 border-blue-500" alt="Preview" />
              <X onClick={() => {setPreview(null); setImageFile(null);}} className="absolute -top-2 -right-2 bg-red-600 rounded-full cursor-pointer p-0.5" />
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl">
            <input type="file" id="cam" hidden onChange={(e: any) => { 
              const file = e.target.files[0];
              setImageFile(file);
              setPreview(URL.createObjectURL(file));
            }} />
            <Camera onClick={() => document.getElementById('cam')?.click()} className="cursor-pointer text-slate-400" />
            <input className="flex-1 bg-transparent outline-none p-1" placeholder="Type or upload image..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} className="bg-blue-600 p-2 rounded-lg"><Send size={18}/></button>
          </div>
        </footer>
      </main>
    </div>
  );
}
