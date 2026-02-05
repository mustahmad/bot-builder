import { useState } from 'react';
import {
  Bot,
  Play,
  Square,
  Download,
  Upload,
  LogOut,
  AlertCircle,
  Check,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { useBotStore } from '../store/botStore.ts';
import { useFlowStore } from '../store/flowStore.ts';
import { useSimulatorStore } from '../store/simulatorStore.ts';
import { useProjectStore } from '../store/projectStore.ts';
import { usePolling } from '../hooks/usePolling.ts';
import { deployBot } from '../services/botEngine.ts';

export function Header() {
  const botInfo = useBotStore((s) => s.botInfo);
  const token = useBotStore((s) => s.token);
  const isDeployed = useBotStore((s) => s.isDeployed);
  const setDeployed = useBotStore((s) => s.setDeployed);
  const error = useBotStore((s) => s.error);
  const setError = useBotStore((s) => s.setError);
  const disconnect = useBotStore((s) => s.disconnect);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const clearFlow = useFlowStore((s) => s.clearFlow);
  const setNodes = useFlowStore((s) => s.setNodes);
  const setEdges = useFlowStore((s) => s.setEdges);
  const clearMessages = useSimulatorStore((s) => s.clearMessages);
  const setView = useProjectStore((s) => s.setView);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const saveProjectFlow = useProjectStore((s) => s.saveProjectFlow);
  const { pollingActive, startPolling, stopPolling } = usePolling();

  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  const handleDeploy = async () => {
    if (!token) return;
    setDeploying(true);
    setError(null);
    setDeploySuccess(false);

    try {
      await deployBot(token, nodes);
      setDeployed(true);
      setDeploySuccess(true);
      startPolling();
      setTimeout(() => setDeploySuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка деплоя');
    } finally {
      setDeploying(false);
    }
  };

  const handleStop = () => {
    stopPolling();
    setDeployed(false);
  };

  const handleExport = () => {
    const config = {
      version: '1.0',
      name: botInfo?.username || 'bot',
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${botInfo?.username || 'bot'}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const config = JSON.parse(text);
        if (config.nodes && config.edges) {
          setNodes(config.nodes);
          setEdges(config.edges);
          setError(null);
        } else {
          setError('Неверный формат файла конфигурации');
        }
      } catch {
        setError('Не удалось прочитать файл');
      }
    };
    input.click();
  };

  const handleBackToProjects = async () => {
    if (activeProjectId) {
      await saveProjectFlow(activeProjectId, nodes, edges);
    }
    stopPolling();
    disconnect();
    clearFlow();
    clearMessages();
    sessionStorage.clear();
    setView('projects');
  };

  const handleDisconnect = async () => {
    if (activeProjectId) {
      await saveProjectFlow(activeProjectId, nodes, edges);
    }
    stopPolling();
    disconnect();
    clearFlow();
    clearMessages();
    sessionStorage.clear();
  };

  const handleTutorial = async () => {
    if (activeProjectId) {
      await saveProjectFlow(activeProjectId, nodes, edges);
    }
    stopPolling();
    disconnect();
    clearFlow();
    clearMessages();
    sessionStorage.clear();
    setView('tutorial');
  };

  return (
    <header className="h-12 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBackToProjects}
          className="flex items-center gap-1.5 text-[var(--color-text-secondary)] text-xs hover:text-[var(--color-text)] transition-colors cursor-pointer"
          title="К проектам"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Проекты</span>
        </button>
        <div className="w-px h-5 bg-[var(--color-border)]" />
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--color-primary)] text-white">
            <Bot size={16} />
          </div>
          <span className="text-sm font-semibold text-[var(--color-text)]">
            LiveBot Builder
          </span>
        </div>
        {botInfo && (
          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-secondary)]">
              @{botInfo.username}
            </span>
            {isDeployed && pollingActive && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                <span className="text-[10px] font-medium">Активен</span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs">
          <AlertCircle size={13} />
          <span className="max-w-[300px] truncate">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-1 text-red-400 hover:text-red-600 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {deploySuccess && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 mr-2 animate-fade-in">
            <Check size={14} />
            Запущен
          </div>
        )}

        {!isDeployed ? (
          <button
            onClick={handleDeploy}
            disabled={deploying || nodes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {deploying ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play size={13} />
            )}
            Запустить
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors cursor-pointer"
          >
            <Square size={13} />
            Остановить
          </button>
        )}

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <button
          onClick={handleExport}
          disabled={nodes.length === 0}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--color-text-secondary)] text-xs font-medium hover:bg-[var(--color-surface-alt)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Экспорт конфигурации"
        >
          <Download size={14} />
          Экспорт
        </button>

        <button
          onClick={handleImport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--color-text-secondary)] text-xs font-medium hover:bg-[var(--color-surface-alt)] transition-colors cursor-pointer"
          title="Импорт конфигурации"
        >
          <Upload size={14} />
          Импорт
        </button>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <button
          onClick={handleTutorial}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--color-text-secondary)] text-xs font-medium hover:bg-[var(--color-surface-alt)] transition-colors cursor-pointer"
          title="Пройти обучение"
        >
          <GraduationCap size={14} />
        </button>

        <button
          onClick={handleDisconnect}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--color-text-muted)] text-xs hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          title="Отключиться"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
