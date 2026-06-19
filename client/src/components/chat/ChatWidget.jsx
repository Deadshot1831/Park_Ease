import { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane, FaParking } from 'react-icons/fa';
import { sendChat } from '../../services/chatService';

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm the ParkEase assistant 👋 Ask me about finding parking, booking, payments, refunds, or listing your space.",
};
const SUGGESTIONS = [
  'How do I book a parking spot?',
  'How do refunds work?',
  'How can I list my space?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      // Send the conversation without the canned greeting (must start with a user turn)
      const history = next.filter((m, i) => !(i === 0 && m.role === 'assistant'));
      const { reply } = await sendChat(history);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: `Sorry, I couldn't reach support just now (${err.message}). Please try again, or call our 24/7 helpline +91 1800 123 4567.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open ParkEase assistant'}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow-brand transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <FaTimes className="text-lg" /> : <FaCommentDots className="text-xl" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] max-h-[calc(100vh-7rem)] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-elevated backdrop-blur-2xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow-brand">
              <FaParking />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">ParkEase Assistant</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · replies instantly
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close">
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-brand-gradient text-white'
                      : 'rounded-bl-sm border border-white/10 bg-white/[0.04] text-slate-200'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions (only before the user has said anything) */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1.5 text-xs text-brand-200 transition hover:bg-brand-500/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 border-t border-white/10 bg-white/[0.03] p-3"
          >
            <input
              ref={inputRef}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-brand-400/60 focus:ring-2 focus:ring-brand-500/30"
              placeholder="Ask about ParkEase…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow-brand transition hover:shadow-glow-soft disabled:opacity-40"
              aria-label="Send"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
