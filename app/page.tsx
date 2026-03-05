// @ts-ignore
"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';
import { Send, BrainCircuit, Sparkles, GraduationCap, Camera, Mic, X, Zap } from "lucide-react";

export default function AdvancedMathPro() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const toggleVoice = () => {
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) return alert("Browser not supported");
    const rec = new Speech();
    rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
    isListening ? rec.stop() : rec.start();
    setIsListening(!isListening);
  };

  const handleSend = async () => {
    if (!input && !image) return;
    setLoading(true);
    const userMsg = { role: "user", content: input, img: preview };
    setMessages([...messages, userMsg]);
    
    const fd = new FormData();
    if (input) fd.append("message", input);
    if (image) fd.append("image", image);

    const res = await fetch("/api/chat", { method: "POST", body: fd });
    const data = await res.json();
    setMessages(prev => [...prev, { role: "bot", content: data.text }]);
    setLoading(false); setInput(""); setImage(null); setPreview(null);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-[#0f172a] border-r border-slate-800 p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-10 text-2xl font-bold">
            <BrainCircuit className="text-blue-500" /> Math<span className="text-blue-500">PRO</span>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <GraduationCap className="mb-2 text-blue-400" />
            <h3 className="font-bold">Mahamudul Hasan</h3>
            <p className="text-xs text-slate-400">ADUST Student</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[80%] ${m.role === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}>
                {m.img && <img src={m.img} className="w-40 rounded mb-2" />}
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && <Zap className="animate-spin text-blue-500" />}
        </div>

        <footer className="p-6 bg-slate-900/50 border-t border-slate-800">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            {preview && <div className="relative w-20 h-20"><img src={preview} className="rounded border-2 border-blue-500" /><X onClick={() => {setPreview(null); setImage(null)}} className="absolute -top-2 -right-2 bg-red-500 rounded-full cursor-pointer" size={16}/></div>}
            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-2xl">
              <input type="file" id="img" hidden onChange={(e:any) => {setImage(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0]))}} />
              <Camera onClick={() => document.getElementById('img')?.click()} className="cursor-pointer text-slate-400 hover:text-white ml-2" />
              <input className="flex-1 bg-transparent outline-none p-2" placeholder="Ask Mahamudul's AI..." value={input} onChange={e => setInput(e.target.value)} />
              <Mic onClick={toggleVoice} className={`cursor-pointer ${isListening ? 'text-red-500' : 'text-slate-400'}`} />
              <button onClick={handleSend} className="bg-blue-600 p-3 rounded-xl hover:bg-blue-500 transition-all"><Send size={20}/></button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
