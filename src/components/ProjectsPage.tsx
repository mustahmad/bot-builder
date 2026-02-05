import { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Edit3,
  FolderOpen,
  GraduationCap,
  Clock,
  Layers,
  Check,
  X,
  LogOut,
  Loader2,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import { useFlowStore } from '../store/flowStore.ts';

export function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const isLoading = useProjectStore((s) => s.isLoading);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const addProject = useProjectStore((s) => s.addProject);
  const deleteProjectFn = useProjectStore((s) => s.deleteProject);
  const renameProjectFn = useProjectStore((s) => s.renameProject);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const setView = useProjectStore((s) => s.setView);
  const setNodes = useFlowStore((s) => s.setNodes);
  const setEdges = useFlowStore((s) => s.setEdges);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [newName, setNewName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async () => {
    const name = newName.trim() || 'Новый бот';
    setCreating(true);
    try {
      const id = await addProject(name);
      setNewName('');
      setShowNewInput(false);
      setActiveProject(id);
      setNodes([]);
      setEdges([]);
      setView('token');
    } finally {
      setCreating(false);
    }
  };

  const handleOpen = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    setActiveProject(id);
    setNodes(project.nodes);
    setEdges(project.edges);
    setView('token');
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleRename = async (id: string) => {
    if (editName.trim()) {
      await renameProjectFn(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteProjectFn(id);
    setDeleteConfirm(null);
  };

  const handleTutorial = () => {
    setView('tutorial');
  };

  const handleLogout = () => {
    logout();
    setView('projects');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Шапка */}
      <header className="bg-white border-b border-[var(--color-border)] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--color-primary)] text-white">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-text)]">
                LiveBot Builder
              </h1>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Визуальный конструктор Telegram-ботов
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTutorial}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-medium hover:bg-[var(--color-primary)]/5 transition-colors cursor-pointer"
            >
              <GraduationCap size={16} />
              Обучение
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-muted)]">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                title="Выйти"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            Мои проекты
          </h2>
          {!showNewInput && (
            <button
              onClick={() => setShowNewInput(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Новый проект
            </button>
          )}
        </div>

        {/* Создание проекта */}
        {showNewInput && (
          <div className="mb-6 bg-white rounded-xl border border-[var(--color-primary)]/30 p-4 animate-fade-in">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Название проекта
            </label>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Например: Бот поддержки"
                autoFocus
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                disabled={creating}
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Создать'
                )}
              </button>
              <button
                onClick={() => {
                  setShowNewInput(false);
                  setNewName('');
                }}
                className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm hover:bg-[var(--color-surface-alt)] transition-colors cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Загрузка */}
        {isLoading && projects.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-text-muted)]">Загрузка проектов...</p>
            </div>
          </div>
        )}

        {/* Список проектов */}
        {!isLoading && projects.length === 0 && !showNewInput ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-surface-alt)] mb-4">
              <FolderOpen size={28} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-base font-medium text-[var(--color-text)] mb-1">
              Пока нет проектов
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto">
              Создайте первый проект или пройдите обучение, чтобы познакомиться с конструктором
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowNewInput(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer"
              >
                <Plus size={16} />
                Новый проект
              </button>
              <button
                onClick={handleTutorial}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-alt)] transition-colors cursor-pointer"
              >
                <GraduationCap size={16} />
                Пройти обучение
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all group cursor-pointer"
                onClick={() => {
                  if (editingId !== project.id && deleteConfirm !== project.id) {
                    handleOpen(project.id);
                  }
                }}
              >
                <div className="p-4">
                  {/* Имя */}
                  {editingId === project.id ? (
                    <div className="flex items-center gap-1.5 mb-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(project.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 rounded border border-[var(--color-primary)] bg-white text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => handleRename(project.id)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-[var(--color-text)] truncate pr-2">
                        {project.name}
                      </h3>
                      <div
                        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            handleStartRename(project.id, project.name)
                          }
                          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] cursor-pointer"
                          title="Переименовать"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(project.id)}
                          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Подтверждение удаления */}
                  {deleteConfirm === project.id && (
                    <div
                      className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-100 animate-fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-xs text-red-700 mb-2">
                        Удалить проект? Это действие необратимо.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-3 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                        >
                          Удалить
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 rounded text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-white cursor-pointer"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Статистика */}
                  <div className="flex items-center gap-4 text-[11px] text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-1">
                      <Layers size={12} />
                      <span>
                        {project.nodes.length}{' '}
                        {project.nodes.length === 1 ? 'блок' : project.nodes.length < 5 ? 'блока' : 'блоков'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Цветная полоска */}
                <div className="h-1 rounded-b-xl bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-node-message)] to-[var(--color-node-buttons)]" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
