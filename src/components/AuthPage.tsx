import { useState } from 'react';
import { Bot, Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore.ts';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loginFn = useAuthStore((s) => s.login);
  const registerFn = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      return;
    }
    try {
      if (mode === 'login') {
        await loginFn(email, password);
      } else {
        await registerFn(email, password);
      }
    } catch {
      // Ошибка уже в store
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  const isRegister = mode === 'register';
  const passwordMismatch = isRegister && confirmPassword && password !== confirmPassword;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)] mb-4 shadow-lg shadow-blue-200">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            LiveBot Builder
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {isRegister
              ? 'Создайте аккаунт, чтобы сохранять проекты'
              : 'Войдите, чтобы продолжить работу с ботами'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-6">
          <div className="flex mb-6 rounded-lg bg-[var(--color-surface-alt)] p-1">
            <button
              onClick={() => { setMode('login'); clearError(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white shadow-sm text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <LogIn size={14} />
              Вход
            </button>
            <button
              onClick={() => { setMode('register'); clearError(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                isRegister
                  ? 'bg-white shadow-sm text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <UserPlus size={14} />
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Email
            </label>
            <div className="relative mb-4">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                disabled={isLoading}
              />
            </div>

            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Пароль
            </label>
            <div className="relative mb-4">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRegister ? 'Минимум 6 символов' : 'Введите пароль'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                disabled={isLoading}
              />
            </div>

            {isRegister && (
              <>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Подтвердите пароль
                </label>
                <div className="relative mb-4">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Повторите пароль"
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border bg-[var(--color-surface-alt)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all ${
                      passwordMismatch
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-200/30'
                        : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {passwordMismatch && (
                  <p className="text-xs text-red-500 -mt-2 mb-4">
                    Пароли не совпадают
                  </p>
                )}
              </>
            )}

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isLoading ||
                !email.trim() ||
                !password.trim() ||
                (isRegister && password !== confirmPassword)
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegister ? 'Регистрация...' : 'Вход...'}
                </>
              ) : (
                <>
                  {isRegister ? 'Зарегистрироваться' : 'Войти'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-[var(--color-text-muted)] mt-4 text-center">
            {isRegister ? 'Уже есть аккаунт? ' : 'Ещё нет аккаунта? '}
            <button
              onClick={switchMode}
              className="text-[var(--color-primary)] font-medium hover:underline cursor-pointer"
            >
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
