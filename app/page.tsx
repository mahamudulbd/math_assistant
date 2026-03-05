"use client";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';
import { Send, BrainCircuit, Sparkles, GraduationCap, Zap, Camera, Mic, MicOff, X, FileImage } from "lucide-react";

export default function MultimodalMathPro() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string; imagePreview?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // অটো-স্ক্রোল সেটিংস
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // স্পিচ রিকগনিশন সেটআপ (ব্রাউজার সাপোর্ট অনুযায়ী)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  // ভয়েস কমান্ড চালু/বন্ধ
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // ইমেজ সিলেক্ট করা
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ইমেজ রিমুভ করা
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // AI-কে প্রশ্ন পাঠানো
  const askMath = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;
    
    // ভয়েস বন্ধ করা যদি চালু থাকে
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const currentImagePreview = imagePreview;
    
    // ইউজার মেসেজ অ্যাড করা
    const userMsg: { role: string; content: string; imagePreview?: string } = { 
      role: "user", 
      content: input || (selectedImage ? "[Analyzed Math Image]" : "") 
    };
    if (currentImagePreview) {
      userMsg.imagePreview = currentImagePreview;
    }
    setMessages(prev => [...prev, userMsg]);
    
    // ইনপুট এবং ইমেজ ক্লিয়ার করা
    setInput("");
    clearImage();
    setLoading(true);

    try {
      const formData = new FormData();
      if (input) formData.append("message", input);
      if (selectedImage) formData.append("image", selectedImage);

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData, // ইমেজ পাঠানোর জন্য FormData ব্যবহার করতে হবে
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", content: data.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "bot", content: "Error connecting to AI Server. Try again, Mahamudul." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#030712] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar - Personal Profile */}
      <aside className="hidden lg:flex w-80 flex-col bg-[#0b1022] border-r border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <BrainCircuit size={28} />
          </div>
          <span className="text-xl font-black tracking-tighter">MATH<span className="text-blue-500">AI</span></span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl mb-8 relative">
          <Zap className="absolute top-4 right-4 text-blue-400 animate-pulse" size={16}/>
          <GraduationCap className="text-blue-500 mb-3" size={32} />
          <h2 className="text-lg font-bold text-white leading-tight">Mahamudul Hasan</h2>
          <p className="text-xs text-slate-400 mt-1">Atish Dipankar University of Science and Technology</p>
          <div className="mt-4 text-[10px] bg-green-900/40 text-green-400 px-3 py-1 rounded-full inline-flex items-center gap-1.5 font-medium border border-green-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Multimodal Active
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Capabilities</p>
          {[
            { icon: Camera, text: "Scan & Solve Images" },
            { icon: Mic, text: "Voice Math Commands" },
            { icon: BrainCircuit, text: "Step-by-Step Logic" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm p-3 rounded-xl bg-slate-800/30 border border-transparent hover:border-slate-700 cursor-pointer transition-all">
              <item.icon className="text-blue-400" size={18}/>
              {item.text}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Multimodal Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Chat Window */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 custom-scrollbar bg-[url('/grid.svg')] bg-center bg-fixed">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-blue-600/10 flex items-center justify-center shadow-xl border border-blue-900 animate-pulse">
                <Sparkles className="text-blue-500" size={48} />
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tighter">Welcome, Mahamudul.</h1>
              <p className="text-lg text-gray-400 max-w-lg">How can I assist your ADUST studies today? Ask a question, upload a problem image, or use voice commands.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-3xl shadow-lg ${
                msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#0e1120] border border-slate-800/80 rounded-tl-none'
              }`}>
                {msg.imagePreview && (
                  <img src={msg.imagePreview} alt="Uploaded problem" className="max-w-xs rounded-xl mb-4 border border-blue-700 shadow-inner" />
                )}
                <ReactMarkdown 
                  remarkPlugins={[remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                  className="prose prose-invert max-w-none text-sm md:text-[15px] leading-relaxed"
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#0e1120] p-5 rounded-3xl animate-pulse flex items-center gap-2 border border-slate-800/80 shadow-md">
                <BrainCircuit className="text-blue-500 animate-spin-slow" size={18}/>
                <span className="text-sm text-gray-400">Mahamudul's assistant is processing instantly...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar (Voice, Image, Text) */}
        <footer className="p-6 bg-[#030712] border-t border-slate-800/70">
          <div className="max-w-5xl mx-auto relative flex flex-col gap-3">
            
            {/* Image Preview Area */}
            {imagePreview && (
              <div className="relative inline-block w-24 h-24">
                <img src={imagePreview} alt="Selected" className="w-24 h-24 object-cover rounded-xl border-2 border-blue-600 shadow-xl" />
                <button onClick={clearImage} className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white shadow-lg">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="relative flex items-center">
              {/* Image Upload Input (Hidden) */}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              
              {/* Image Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-3 p-3 text-slate-500 hover:text-blue-500 transition-colors"
                title="Upload Math Image"
              >
                <Camera size={22} />
              </button>

              {/* Text Input */}
              <input 
                className={`w-full bg-[#0e1120] border rounded-2xl px-28 py-5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-100 text-lg placeholder:text-gray-600 shadow-inner ${
                  selectedImage ? 'border-blue-700' : 'border-slate-800'
                }`}
                placeholder={isListening ? "Listening... (Talk now)" : "Ask or Paste Problem Image (e.g. Differentiate x³)"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askMath()}
              />
              
              <div className="absolute right-3 flex items-center gap-2">
                {/* Voice Button */}
                <button 
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-all ${
                    isListening ? 'bg-red-900 text-red-300 animate-pulse' : 'text-slate-500 hover:text-blue-500'
                  }`}
                  title={isListening ? "Stop Listening" : "Start Voice Command"}
                >
                  {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {/* Send Button */}
                <button 
                  onClick={askMath} 
                  disabled={loading}
                  className="p-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white disabled:opacity-50 disabled:bg-slate-700 transition-all shadow-lg"
                >
                  <Send size={22} />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
