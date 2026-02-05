import { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useSimulatorStore } from '../store/simulatorStore.ts';
import { useFlowStore } from '../store/flowStore.ts';
import { simulateInput, simulateButtonClick } from '../services/botEngine.ts';
import type { ButtonItem } from '../types/index.ts';

export function ChatSimulator() {
  const [input, setInput] = useState('');
  const messages = useSimulatorStore((s) => s.messages);
  const addMessage = useSimulatorStore((s) => s.addMessage);
  const addMessages = useSimulatorStore((s) => s.addMessages);
  const clearMessages = useSimulatorStore((s) => s.clearMessages);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage({
      id: crypto.randomUUID(),
      sender: 'user',
      text: trimmed,
      timestamp: Date.now(),
    });

    const responses = simulateInput(trimmed, nodes, edges);
    if (responses.length > 0) {
      setTimeout(() => {
        addMessages(responses);
      }, 300);
    }

    setInput('');
  };

  const handleButtonClick = (btn: ButtonItem) => {
    if (btn.url) {
      window.open(btn.url, '_blank');
      return;
    }

    addMessage({
      id: crypto.randomUUID(),
      sender: 'user',
      text: btn.text,
      timestamp: Date.now(),
    });

    const responses = simulateButtonClick(
      btn.callbackData || btn.text,
      nodes,
      edges
    );
    if (responses.length > 0) {
      setTimeout(() => {
        addMessages(responses);
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            Симулятор
          </span>
        </div>
        <button
          onClick={clearMessages}
          className="p-1 rounded hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          title="Очистить чат"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-[var(--color-text-muted)] text-center leading-relaxed">
              Отправьте команду,
              <br />
              чтобы протестировать бота
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-snug ${
                msg.sender === 'user'
                  ? 'bg-[var(--color-primary)] text-white rounded-br-sm'
                  : 'bg-[var(--color-surface-alt)] text-[var(--color-text)] border border-[var(--color-border)] rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
            {msg.buttons && msg.buttons.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 w-[85%]">
                {msg.buttons.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => handleButtonClick(btn)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors font-medium cursor-pointer"
                  >
                    {btn.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите /start или сообщение..."
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
