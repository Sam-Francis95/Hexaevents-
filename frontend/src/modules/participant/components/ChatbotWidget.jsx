import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { sendChatMessage } from '../services/chatbotService';

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm the HexaEvents assistant. Ask me about upcoming events, registration, eligibility, or deadlines.",
};

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setIsSending(true);

    const res = await sendChatMessage(trimmed);
    setIsSending(false);

    const reply = res.success ? res.data.reply : "Sorry, I couldn't reach the assistant just now. Please try again.";
    setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex h-[440px] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-popover animate-slide-up">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-accent-500 px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <Bot className="size-4" />
              <span className="text-sm font-semibold">HexaEvents Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto scrollbar-thin px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                    m.role === 'user' ? 'bg-accent-500 text-white' : 'bg-canvas text-ink-900'
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-canvas px-3 py-2 text-sm text-ink-500">Thinking…</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about an event…"
              className="h-9 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-accent-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              aria-label="Send message"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-white disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        className="flex size-14 items-center justify-center rounded-full bg-accent-500 text-white shadow-popover transition-transform hover:scale-105"
      >
        {isOpen ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </div>
  );
}
