import { Bot, GraduationCap, ArrowRight } from 'lucide-react';
import { useProjectStore } from '../store/projectStore.ts';

export function OnboardingModal() {
  const setShowOnboarding = useProjectStore((s) => s.setShowOnboarding);
  const setView = useProjectStore((s) => s.setView);

  const handleSkip = () => {
    setShowOnboarding(false);
  };

  const handleTutorial = () => {
    setShowOnboarding(false);
    setView('tutorial');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Header illustration */}
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-blue-600 px-8 py-10 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4 backdrop-blur-sm">
            <Bot size={32} />
          </div>
          <h2 className="text-xl font-bold mb-1">
            Добро пожаловать в LiveBot Builder!
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed">
            Создавайте Telegram-ботов визуально, без единой строчки кода
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
            Похоже, вы здесь впервые. Хотите пройти интерактивное обучение? Мы
            вместе создадим бота с командами, кнопками и сценариями — и вы
            быстро разберётесь, как всё работает.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleTutorial}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer"
            >
              <GraduationCap size={18} />
              Да, пройти обучение
            </button>
            <button
              onClick={handleSkip}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-alt)] transition-colors cursor-pointer"
            >
              Нет, я разберусь сам
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
