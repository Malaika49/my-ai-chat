"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Square, Send, Sparkles, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPlayground() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hello! Main aapka custom streaming AI hoon. Aaj hum kya code karein?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom abort controller generation to stop streaming
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // Auto-scroll logic
  const scrollToBottom = () => {
    if (chatContainerRef.current && !userHasScrolledUp) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Monitor manual user scrolling
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setUserHasScrolledUp(!isAtBottom);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setUserHasScrolledUp(false); // Reset scroll on new message

    // Create abort controller for the "Stop" button
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
        signal: controller.signal
      });

      if (!response.body) throw new Error("No response body");

      // Set up recipient placeholder message
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Dynamic state update to stream token-by-token on the UI
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("Stream stopped by the user.");
      } else {
        console.error("Streaming error:", err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop button implementation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight">Streaming AI Chat Interface</h1>
        </div>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
          FE-06 Active
        </span>
      </header>

      {/* Main Chat Area */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div className={`p-4 rounded-2xl max-w-[85%] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content || "..."}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking Indicator */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none w-[120px]">
                <div className="flex space-x-1.5 justify-center items-center py-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input controls */}
      <footer className="bg-slate-950 border-t border-slate-800 p-4">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-emerald-500 text-slate-100 disabled:opacity-50 text-sm"
            />
            {isLoading && (
              <button
                type="button"
                onClick={handleStop}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-rose-400 hover:text-rose-300 transition"
                title="Stop streaming"
              >
                <Square className="w-5 h-5 fill-rose-400" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition disabled:opacity-40 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}