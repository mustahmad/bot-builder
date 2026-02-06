import { useState } from 'react';
import {
  Terminal,
  MessageSquare,
  LayoutGrid,
  GitBranch,
  Radio,
  ImageIcon,
  Clock,
  Globe,
  MessageCircleQuestion,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { DragEvent } from 'react';

interface PaletteBlock {
  type: string;
  label: string;
  description: string;
  example: string;
  color: string;
  icon: React.ReactNode;
}

const BLOCKS: PaletteBlock[] = [
  {
    type: 'command',
    label: 'Команда',
    description: 'Точка входа — бот реагирует на команду пользователя.',
    example: 'Хотите, чтобы бот запускался по /start? Добавьте этот блок.',
    color: 'var(--color-node-command)',
    icon: <Terminal size={16} />,
  },
  {
    type: 'message',
    label: 'Сообщение',
    description: 'Бот отправляет текстовое сообщение пользователю.',
    example: 'Хотите приветствовать пользователя? Подключите этот блок после команды.',
    color: 'var(--color-node-message)',
    icon: <MessageSquare size={16} />,
  },
  {
    type: 'buttons',
    label: 'Кнопки',
    description: 'Inline или Reply кнопки для интерактивного выбора.',
    example: 'Хотите дать выбор? Добавьте кнопки после сообщения.',
    color: 'var(--color-node-buttons)',
    icon: <LayoutGrid size={16} />,
  },
  {
    type: 'condition',
    label: 'Условие',
    description: 'Проверяет текст или callback — два пути: Да / Нет.',
    example: 'Хотите по-разному отвечать на разные слова? Используйте условие.',
    color: 'var(--color-node-condition)',
    icon: <GitBranch size={16} />,
  },
  {
    type: 'broadcast',
    label: 'Рассылка',
    description: 'Отправляет сообщение всем пользователям бота.',
    example: 'Хотите уведомить всех? Подключите к команде /broadcast.',
    color: 'var(--color-node-broadcast)',
    icon: <Radio size={16} />,
  },
  {
    type: 'image',
    label: 'Изображение',
    description: 'Отправляет фото с подписью пользователю.',
    example: 'Укажите URL картинки и добавьте подпись.',
    color: 'var(--color-node-image)',
    icon: <ImageIcon size={16} />,
  },
  {
    type: 'delay',
    label: 'Задержка',
    description: 'Пауза перед следующим действием.',
    example: 'Добавьте паузу между сообщениями для естественного ритма.',
    color: 'var(--color-node-delay)',
    icon: <Clock size={16} />,
  },
  {
    type: 'apiRequest',
    label: 'API запрос',
    description: 'HTTP запрос к внешнему сервису.',
    example: 'Получайте данные с сервера. Два выхода: Успех и Ошибка.',
    color: 'var(--color-node-apiRequest)',
    icon: <Globe size={16} />,
  },
  {
    type: 'inputWait',
    label: 'Ожидание ввода',
    description: 'Ждёт текстовый ответ пользователя.',
    example: 'Задайте вопрос и сохраните ответ в переменную.',
    color: 'var(--color-node-inputWait)',
    icon: <MessageCircleQuestion size={16} />,
  },
];

const DEFAULT_DATA: Record<string, Record<string, unknown>> = {
  command: { command: '/start', description: 'Стартовая команда' },
  message: { text: '', parseMode: 'HTML' },
  buttons: { buttons: [], layout: 'vertical' },
  condition: { conditionType: 'text_equals', value: '' },
  broadcast: { message: '', parseMode: 'HTML' },
  image: { imageUrl: '', caption: '', parseMode: 'HTML' },
  delay: { delaySeconds: 3, showTyping: true },
  apiRequest: { url: '', method: 'GET', headers: '', body: '', responseVariable: '' },
  inputWait: { promptText: '', variableName: '', validation: 'none', errorText: '' },
};

export function BlockPalette() {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  const onDragStart = (e: DragEvent, blockType: string) => {
    e.dataTransfer.setData('application/reactflow-type', blockType);
    e.dataTransfer.setData(
      'application/reactflow-data',
      JSON.stringify(DEFAULT_DATA[blockType])
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const toggleExpand = (type: string) => {
    setExpandedBlock(expandedBlock === type ? null : type);
  };

  return (
    <div className="w-[220px] min-w-[220px] bg-white border-r border-[var(--color-border)] flex flex-col h-full">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Блоки
        </h2>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-snug">
          Перетащите блок на холст
        </p>
      </div>
      <div className="p-3 flex flex-col gap-2 overflow-y-auto flex-1">
        {BLOCKS.map((block) => (
          <div key={block.type} className="flex flex-col">
            <div
              draggable
              onDragStart={(e) => onDragStart(e, block.type)}
              className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-border)] cursor-grab active:cursor-grabbing hover:border-[var(--color-border-dark)] hover:shadow-sm transition-all select-none group"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-white"
                style={{ backgroundColor: block.color }}
              >
                {block.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {block.label}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleExpand(block.type);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                  >
                    {expandedBlock === block.type ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                  </button>
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                  {block.description}
                </div>
              </div>
            </div>
            {expandedBlock === block.type && (
              <div className="mx-1 mt-1 p-2.5 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border)] animate-fade-in">
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  {block.example}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-[var(--color-border)]">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center leading-relaxed">
          Соедините блоки стрелками: тяните от нижнего кружка к верхнему
        </p>
      </div>
    </div>
  );
}
