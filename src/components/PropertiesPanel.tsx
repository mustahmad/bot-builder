import { useMemo } from 'react';
import {
  X,
  Copy,
  Trash2,
  Plus,
  Terminal,
  MessageSquare,
  LayoutGrid,
  GitBranch,
  Radio,
} from 'lucide-react';
import { useFlowStore } from '../store/flowStore.ts';
import type { ButtonItem } from '../types/index.ts';

const NODE_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  command: {
    label: 'Команда',
    color: 'var(--color-node-command)',
    icon: <Terminal size={14} />,
  },
  message: {
    label: 'Сообщение',
    color: 'var(--color-node-message)',
    icon: <MessageSquare size={14} />,
  },
  buttons: {
    label: 'Кнопки',
    color: 'var(--color-node-buttons)',
    icon: <LayoutGrid size={14} />,
  },
  condition: {
    label: 'Условие',
    color: 'var(--color-node-condition)',
    icon: <GitBranch size={14} />,
  },
  broadcast: {
    label: 'Рассылка',
    color: 'var(--color-node-broadcast)',
    icon: <Radio size={14} />,
  },
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-2.5 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-2.5 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CommandProperties({ data, update }: { data: Record<string, unknown>; update: (d: Record<string, unknown>) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <InputField
        label="Команда"
        value={(data.command as string) || ''}
        onChange={(v) => update({ command: v.startsWith('/') ? v : '/' + v })}
        placeholder="/start"
        mono
      />
      <InputField
        label="Описание"
        value={(data.description as string) || ''}
        onChange={(v) => update({ description: v })}
        placeholder="Что делает эта команда"
      />
    </div>
  );
}

function MessageProperties({ data, update }: { data: Record<string, unknown>; update: (d: Record<string, unknown>) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <TextareaField
        label="Текст сообщения"
        value={(data.text as string) || ''}
        onChange={(v) => update({ text: v })}
        placeholder="Введите ответ бота..."
        rows={4}
      />
      <SelectField
        label="Режим разметки"
        value={(data.parseMode as string) || 'HTML'}
        onChange={(v) => update({ parseMode: v })}
        options={[
          { value: 'HTML', label: 'HTML' },
          { value: 'MarkdownV2', label: 'MarkdownV2' },
        ]}
      />
      <div className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
        HTML-теги: &lt;b&gt;жирный&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;, &lt;a href="url"&gt;ссылка&lt;/a&gt;
      </div>
    </div>
  );
}

function ButtonsProperties({ data, update }: { data: Record<string, unknown>; update: (d: Record<string, unknown>) => void }) {
  const buttons: ButtonItem[] = (data.buttons as ButtonItem[]) || [];

  const addButton = () => {
    const newBtn: ButtonItem = {
      id: crypto.randomUUID(),
      text: 'Новая кнопка',
      buttonType: 'inline',
      callbackData: '',
      url: '',
    };
    update({ buttons: [...buttons, newBtn] });
  };

  const updateButton = (index: number, field: string, value: string) => {
    const updated = buttons.map((btn, i) =>
      i === index ? { ...btn, [field]: value } : btn
    );
    update({ buttons: updated });
  };

  const removeButton = (index: number) => {
    update({ buttons: buttons.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex flex-col gap-3">
      <SelectField
        label="Расположение"
        value={(data.layout as string) || 'vertical'}
        onChange={(v) => update({ layout: v })}
        options={[
          { value: 'vertical', label: 'Вертикально' },
          { value: 'horizontal', label: 'Горизонтально' },
        ]}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">
            Кнопки ({buttons.length})
          </label>
          <button
            onClick={addButton}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors cursor-pointer"
          >
            <Plus size={12} />
            Добавить
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
          {buttons.map((btn, i) => (
            <div
              key={btn.id}
              className="p-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                  Кнопка {i + 1}
                </span>
                <button
                  onClick={() => removeButton(i)}
                  className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  value={btn.text}
                  onChange={(e) => updateButton(i, 'text', e.target.value)}
                  placeholder="Текст кнопки"
                  className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
                />
                <select
                  value={btn.buttonType}
                  onChange={(e) =>
                    updateButton(i, 'buttonType', e.target.value)
                  }
                  className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-white text-xs focus:outline-none"
                >
                  <option value="inline">Inline</option>
                  <option value="reply">Reply</option>
                </select>
                {btn.buttonType === 'inline' && (
                  <>
                    <input
                      value={btn.callbackData}
                      onChange={(e) =>
                        updateButton(i, 'callbackData', e.target.value)
                      }
                      placeholder="Callback data"
                      className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
                    />
                    <input
                      value={btn.url}
                      onChange={(e) =>
                        updateButton(i, 'url', e.target.value)
                      }
                      placeholder="URL (необязательно)"
                      className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConditionProperties({ data, update }: { data: Record<string, unknown>; update: (d: Record<string, unknown>) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <SelectField
        label="Тип условия"
        value={(data.conditionType as string) || 'text_equals'}
        onChange={(v) => update({ conditionType: v })}
        options={[
          { value: 'text_equals', label: 'Текст равен' },
          { value: 'text_contains', label: 'Текст содержит' },
          { value: 'callback_data', label: 'Callback data' },
        ]}
      />
      <InputField
        label="Значение"
        value={(data.value as string) || ''}
        onChange={(v) => update({ value: v })}
        placeholder="Введите значение для сравнения"
        mono
      />
      <div className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
        Соедините зелёный выход (Да) и красный выход (Нет) с разными блоками.
      </div>
    </div>
  );
}

function BroadcastProperties({ data, update }: { data: Record<string, unknown>; update: (d: Record<string, unknown>) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <TextareaField
        label="Текст рассылки"
        value={(data.message as string) || ''}
        onChange={(v) => update({ message: v })}
        placeholder="Сообщение для отправки всем пользователям..."
        rows={4}
      />
      <SelectField
        label="Режим разметки"
        value={(data.parseMode as string) || 'HTML'}
        onChange={(v) => update({ parseMode: v })}
        options={[
          { value: 'HTML', label: 'HTML' },
          { value: 'MarkdownV2', label: 'MarkdownV2' },
        ]}
      />
    </div>
  );
}

export function PropertiesPanel() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const removeNode = useFlowStore((s) => s.removeNode);
  const duplicateNode = useFlowStore((s) => s.duplicateNode);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  if (!selectedNode) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-muted)] p-4 text-center">
        Выберите блок на холсте для редактирования свойств
      </div>
    );
  }

  const meta = NODE_META[selectedNode.type || ''];
  const data = selectedNode.data as Record<string, unknown>;

  const update = (newData: Record<string, unknown>) => {
    updateNodeData(selectedNode.id, newData);
  };

  return (
    <div className="animate-slide-in-right">
      <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          {meta && (
            <div
              className="flex items-center justify-center w-6 h-6 rounded text-white"
              style={{ backgroundColor: meta.color }}
            >
              {meta.icon}
            </div>
          )}
          <span className="text-sm font-medium">{meta?.label || 'Блок'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => duplicateNode(selectedNode.id)}
            className="p-1.5 rounded hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            title="Дублировать"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => {
              removeNode(selectedNode.id);
              setSelectedNode(null);
            }}
            className="p-1.5 rounded hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-500 transition-colors cursor-pointer"
            title="Удалить"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setSelectedNode(null)}
            className="p-1.5 rounded hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-3">
        {selectedNode.type === 'command' && (
          <CommandProperties data={data} update={update} />
        )}
        {selectedNode.type === 'message' && (
          <MessageProperties data={data} update={update} />
        )}
        {selectedNode.type === 'buttons' && (
          <ButtonsProperties data={data} update={update} />
        )}
        {selectedNode.type === 'condition' && (
          <ConditionProperties data={data} update={update} />
        )}
        {selectedNode.type === 'broadcast' && (
          <BroadcastProperties data={data} update={update} />
        )}
      </div>
    </div>
  );
}
