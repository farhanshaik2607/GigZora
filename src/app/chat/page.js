'use client';

import { useState, useRef, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';

const QUICK_TOPICS = [
  { icon: '💰', label: 'Pricing', prompt: 'How should I price my freelance services?' },
  { icon: '📜', label: 'Legal', prompt: 'What legal protections do I need as a freelancer?' },
  { icon: '📋', label: 'Contracts', prompt: 'What should I include in a freelance contract?' },
  { icon: '🧾', label: 'Invoicing', prompt: 'Best invoicing practices for freelancers' },
  { icon: '🚀', label: 'Startup', prompt: 'How do I start a freelance business?' },
  { icon: '🤝', label: 'Clients', prompt: 'How do I find and retain freelance clients?' },
  { icon: '📝', label: 'Proposals', prompt: 'How do I write a winning proposal?' },
  { icon: '🧮', label: 'Taxes', prompt: 'Tax tips for freelancers' },
  { icon: '📣', label: 'Marketing', prompt: 'How do I build my personal brand as a freelancer?' },
  { icon: '📧', label: 'Cold Email', prompt: 'Help me write a cold outreach email' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const updatedMessages = [...messages, { role: 'user', content: msg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: updatedMessages.slice(-10),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || "I'm not sure about that. Try asking about pricing, contracts, or marketing!",
        intent: data.intent,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, something went wrong. Please try again!",
      }]);
    } finally {
      setLoading(false);
    }
  };

  function renderContent(text) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      if (line.trim() === '') return <br key={i} />;
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('|')) {
        return <div key={i} className="font-mono text-xs leading-relaxed">{parts}</div>;
      }
      if (line.trim().match(/^[0-9]+\./)) {
        return <div key={i} className="ml-2">{parts}</div>;
      }
      return <div key={i}>{parts}</div>;
    });
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white mb-2">
            GigZora AI Assistant
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Your freelance business advisor — powered by pure JS intelligence, no external APIs.
          </p>
        </div>

        {/* Chat Area */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 260px)' }}>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">💼</div>
                <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-2">
                  What can I help you with?
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-8 max-w-md mx-auto">
                  I specialize in 10 freelance topics. Pick one below or type your own question.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl mx-auto">
                  {QUICK_TOPICS.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(topic.prompt)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
                    >
                      <span className="text-2xl">{topic.icon}</span>
                      <span className="text-xs font-medium text-surface-600 dark:text-surface-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-[80%]`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-sm">🤖</span>
                      </div>
                    )}
                    <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-bl-sm'
                    }`}>
                      {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-sm">👤</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="bg-surface-100 dark:bg-surface-800 px-5 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-surface-200 dark:border-surface-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about pricing, contracts, taxes, marketing..."
                className="flex-1 px-5 py-3 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm dark:text-white"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="px-5 py-3 rounded-xl bg-primary-600 text-white font-medium disabled:opacity-50 hover:bg-primary-700 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
