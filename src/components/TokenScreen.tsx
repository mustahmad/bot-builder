import { useState } from 'react';
import { Bot, ArrowRight, ArrowLeft, Shield, Zap, Eye } from 'lucide-react';
import { useBotStore } from '../store/botStore.ts';
import { useProjectStore } from '../store/projectStore.ts';
import { getMe } from '../services/telegramApi.ts';

export function TokenScreen() {
  const [tokenInput, setTokenInput] = useState('');
  const setToken = useBotStore((s) => s.setToken);
  const setBotInfo = useBotStore((s) => s.setBotInfo);
  const setConnected = useBotStore((s) => s.setConnected);
  const setConnecting = useBotStore((s) => s.setConnecting);
  const isConnecting = useBotStore((s) => s.isConnecting);
  const error = useBotStore((s) => s.error);
  const setError = useBotStore((s) => s.setError);
  const setView = useProjectStore((s) => s.setView);

  const handleConnect = async () => {
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setError('Введите токен бота');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const info = await getMe(trimmed);
      setToken(trimmed);
      setBotInfo(info);
      setConnected(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось подключиться. Проверьте токен.'
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isConnecting) {
      handleConnect();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="w-full max-w-md animate-fade-in">
        <button
          onClick={() => setView('projects')}
          className="flex items-center gap-1.5 mb-6 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Назад к проектам
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)] mb-4 shadow-lg shadow-blue-200">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            LiveBot Builder
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Визуальный конструктор Telegram-ботов с обновлением в реальном времени
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-6">
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Токен бота
          </label>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all font-mono"
            disabled={isConnecting}
          />

          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting || !tokenInput.trim()}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Подключение...
              </>
            ) : (
              <>
                Подключить бота
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-[11px] text-[var(--color-text-muted)] mt-3 text-center leading-relaxed">
            Получите токен у{' '}
            <span className="font-medium text-[var(--color-text-secondary)]">
              @BotFather
            </span>{' '}
            в Telegram. Токен не сохраняется.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-[var(--color-border)]">
            <Zap size={18} className="text-amber-500 mb-1.5" />
            <span className="text-[11px] font-medium text-[var(--color-text)]">
              Live-режим
            </span>
          </div>
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-[var(--color-border)]">
            <Eye size={18} className="text-emerald-500 mb-1.5" />
            <span className="text-[11px] font-medium text-[var(--color-text)]">
              Симулятор
            </span>
          </div>
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-[var(--color-border)]">
            <Shield size={18} className="text-blue-500 mb-1.5" />
            <span className="text-[11px] font-medium text-[var(--color-text)]">
              Безопасно
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
