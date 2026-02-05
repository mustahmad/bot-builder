import { useEffect } from 'react';
import { useBotStore } from './store/botStore.ts';
import { useProjectStore } from './store/projectStore.ts';
import { useAuthStore } from './store/authStore.ts';
import { AuthPage } from './components/AuthPage.tsx';
import { ProjectsPage } from './components/ProjectsPage.tsx';
import { TokenScreen } from './components/TokenScreen.tsx';
import { Workspace } from './components/Workspace.tsx';
import { Tutorial } from './components/Tutorial.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { useSessionTimeout } from './hooks/useSessionTimeout.ts';

function App() {
  const isConnected = useBotStore((s) => s.isConnected);
  const view = useProjectStore((s) => s.view);
  const showOnboarding = useProjectStore((s) => s.showOnboarding);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  useSessionTimeout();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Показываем загрузку пока проверяем токен
  if (isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-muted)]">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если не авторизован — показываем страницу входа
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderView = () => {
    switch (view) {
      case 'projects':
        return <ProjectsPage />;
      case 'tutorial':
        return <Tutorial />;
      case 'token':
        return isConnected ? <Workspace /> : <TokenScreen />;
      case 'workspace':
        return isConnected ? <Workspace /> : <TokenScreen />;
      default:
        return <ProjectsPage />;
    }
  };

  return (
    <>
      {renderView()}
      {showOnboarding && view === 'projects' && <OnboardingModal />}
    </>
  );
}

export default App;
