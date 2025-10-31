import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { MessageSquareIcon, SearchIcon, XIcon, WandSparklesIcon } from './Icons';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isResponding: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isResponding,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-gray-800/80 backdrop-blur-md rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
            <MessageSquareIcon className="h-6 w-6 text-[var(--color-primary)]" />
            <h2 className="text-lg font-bold text-white">AI Assistant</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-700 text-gray-200'}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-gray-600">
                                <h4 className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
                                    <SearchIcon className="h-3 w-3" />
                                    Sources:
                                </h4>
                                <ul className="text-xs space-y-1">
                                    {msg.sources.map((source, i) => (
                                        <li key={i}>
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline truncate block">
                                                {source.title || new URL(source.uri).hostname}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {isResponding && (
                <div className="flex justify-start">
                    <div className="max-w-sm px-4 py-3 rounded-xl bg-gray-700 text-gray-200 flex items-center gap-2">
                         <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
                         <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse delay-75"></div>
                         <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            className="w-full h-12 p-3 pr-12 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200 resize-none"
            rows={1}
            disabled={isResponding}
          />
          <button
            onClick={handleSend}
            disabled={isResponding || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 disabled:bg-gray-600 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <WandSparklesIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;