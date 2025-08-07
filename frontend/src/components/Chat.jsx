import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import io from "socket.io-client";

const socket = io("https://lunabot-m206.onrender.com");

const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("AI-Response", (data) => {
      setMessages((prev) => [...prev, { sender: "bot", text: data }]);
      setLoading(false);
    });

    socket.on("ai-error", (error) => {
      console.error("AI Error:", error);
      setLoading(false);
    });

    return () => {
      socket.off("AI-Response");
      socket.off("ai-error");
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    socket.emit("ai-prompt", input);
    setInput("");
    setLoading(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full max-w-2xl bg-[#0e1320] shadow-2xl rounded-2xl border border-gray-700 flex flex-col h-[85vh] min-h-[500px] max-h-[700px] overflow-hidden">
        {/* Header */}
        <div className="bg-[#131a2d] px-6 py-4 border-b border-gray-700 text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center justify-center">
            <motion.span
              className="mr-2"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              🌙
            </motion.span>
            LunaBot
          </h1>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-hidden">
          <SimpleBar className="h-full px-4 sm:px-6 py-4 bg-[#0e1320]">
            <div className="space-y-3">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm shadow-lg transition-all duration-300 transform break-words ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                          : "bg-[#1a2238] text-gray-200 rounded-bl-none"
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          a: ({ node, ...props }) => (
                            <a 
                              className="text-blue-400 hover:text-blue-300 underline break-all" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              {...props} 
                            />
                          ),
                          code: ({ node, ...props }) => (
                            <code className="bg-gray-800 px-1 py-0.5 rounded text-pink-300" {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading bubble */}
              {loading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-[#1a2238] text-gray-300 px-4 py-3 rounded-2xl text-sm rounded-bl-none flex gap-1 animate-pulse">
                    Typing
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </SimpleBar>
        </div>

        {/* Input Area */}
        <div className="flex border-t border-gray-700 bg-[#131a2d]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-grow px-6 py-4 text-base bg-[#131a2d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 rounded-bl-2xl"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 text-base rounded-br-2xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-purple-700 hover:scale-105"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;