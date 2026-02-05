import { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Terminal,
  MessageSquare,
  LayoutGrid,
  GitBranch,
  Radio,
  Sparkles,
  MousePointerClick,
  Link2,
  TestTube,
  PartyPopper,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore.ts';
import { useFlowStore } from '../store/flowStore.ts';
import { useSimulatorStore } from '../store/simulatorStore.ts';
import { FlowEditor } from './FlowEditor.tsx';
import { ChatSimulator } from './ChatSimulator.tsx';
import type { Node, Edge } from '@xyflow/react';

interface TutorialStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  details: string[];
  tip?: string;
  nodes?: Node[];
  edges?: Edge[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Добро пожаловать!',
    icon: <Sparkles size={20} />,
    description:
      'В этом обучении мы вместе создадим полноценного Telegram-бота с командами, сообщениями, кнопками, условиями и рассылкой. Вы научитесь пользоваться всеми основными функциями конструктора.',
    details: [
      'Справа вы видите холст — здесь мы будем собирать бота из блоков.',
      'Внизу — симулятор чата, где можно протестировать бота прямо в браузере.',
      'Каждый шаг обучения автоматически добавляет блоки на холст и объясняет, как они работают.',
    ],
    tip: 'Следуйте шагам по порядку — каждый новый шаг добавляет новые блоки к уже существующим.',
    nodes: [],
    edges: [],
  },
  {
    id: 'command',
    title: 'Блок «Команда»',
    icon: <Terminal size={20} />,
    description:
      'Команда — это точка входа в бота. Когда пользователь отправляет /start, /help или любую другую команду, бот начинает выполнять сценарий с этого блока.',
    details: [
      'Хотите, чтобы бот реагировал на /start? Добавьте блок «Команда» и укажите /start.',
      'Можно создать сколько угодно команд: /help, /menu, /settings и т.д.',
      'Блок команды сам по себе ничего не отправляет — он лишь определяет, КОГДА запускать сценарий.',
    ],
    tip: 'Каждый бот должен иметь хотя бы команду /start — это первое, что видит пользователь.',
    nodes: [
      {
        id: 'tut-cmd-start',
        type: 'command',
        position: { x: 250, y: 40 },
        data: { command: '/start', description: 'Запустить бота' },
      },
      {
        id: 'tut-cmd-help',
        type: 'command',
        position: { x: 500, y: 40 },
        data: { command: '/help', description: 'Справка' },
      },
    ],
    edges: [],
  },
  {
    id: 'message',
    title: 'Блок «Сообщение»',
    icon: <MessageSquare size={20} />,
    description:
      'Сообщение — это текст, который бот отправит пользователю. Подключите его к команде, чтобы бот отвечал при вызове команды.',
    details: [
      'Хотите, чтобы бот приветствовал пользователя? Создайте сообщение «Привет! 👋» и подключите к /start.',
      'В одном сценарии можно отправить несколько сообщений подряд — просто соедините их цепочкой.',
      'Поддерживается HTML-разметка: <b>жирный</b>, <i>курсив</i>, <code>код</code>.',
    ],
    tip: 'Сообщение без подключённой команды никогда не отправится — обязательно соедините блоки.',
    nodes: [
      {
        id: 'tut-cmd-start',
        type: 'command',
        position: { x: 250, y: 40 },
        data: { command: '/start', description: 'Запустить бота' },
      },
      {
        id: 'tut-msg-welcome',
        type: 'message',
        position: { x: 250, y: 160 },
        data: {
          text: 'Привет! Я LiveBot — твой помощник. Чем могу помочь?',
          parseMode: 'HTML',
        },
      },
      {
        id: 'tut-cmd-help',
        type: 'command',
        position: { x: 500, y: 40 },
        data: { command: '/help', description: 'Справка' },
      },
      {
        id: 'tut-msg-help',
        type: 'message',
        position: { x: 500, y: 160 },
        data: {
          text: 'Доступные команды:\n/start — запуск бота\n/help — эта справка',
          parseMode: 'HTML',
        },
      },
    ],
    edges: [
      {
        id: 'tut-e1',
        source: 'tut-cmd-start',
        target: 'tut-msg-welcome',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e2',
        source: 'tut-cmd-help',
        target: 'tut-msg-help',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'connect',
    title: 'Соединение блоков',
    icon: <Link2 size={20} />,
    description:
      'Блоки соединяются стрелками — так вы определяете порядок выполнения. Тяните от нижнего кружка одного блока к верхнему кружку другого.',
    details: [
      'Нижний кружок блока — это «выход» (откуда идёт поток).',
      'Верхний кружок — это «вход» (куда приходит поток).',
      'Один блок может быть подключён к нескольким следующим — бот выполнит их все по порядку.',
      'Попробуйте: наведите курсор на нижний кружок блока «Команда /start» — он подсветится. Зажмите и тяните к верхнему кружку блока «Сообщение».',
    ],
    tip: 'Если стрелка пропала или блоки не соединяются, убедитесь, что тянете от НИЖНЕГО кружка к ВЕРХНЕМУ.',
  },
  {
    id: 'buttons',
    title: 'Блок «Кнопки»',
    icon: <LayoutGrid size={20} />,
    description:
      'Кнопки позволяют пользователю выбирать действия без ввода текста. Есть два типа: inline (под сообщением) и reply (вместо клавиатуры).',
    details: [
      'Хотите дать пользователю выбор? Добавьте кнопки после сообщения.',
      'Inline кнопки появляются прямо под сообщением — удобно для меню и действий.',
      'Reply кнопки заменяют клавиатуру — подходят для часто используемых команд.',
      'Каждая кнопка имеет «callback data» — скрытое значение, которое бот получает при нажатии.',
    ],
    tip: 'Подключите блок кнопок СРАЗУ после сообщения — тогда кнопки появятся прямо под текстом.',
    nodes: [
      {
        id: 'tut-cmd-start',
        type: 'command',
        position: { x: 250, y: 40 },
        data: { command: '/start', description: 'Запустить бота' },
      },
      {
        id: 'tut-msg-welcome',
        type: 'message',
        position: { x: 250, y: 160 },
        data: {
          text: 'Привет! Я LiveBot — твой помощник. Чем могу помочь?',
          parseMode: 'HTML',
        },
      },
      {
        id: 'tut-btns-main',
        type: 'buttons',
        position: { x: 250, y: 300 },
        data: {
          buttons: [
            {
              id: 'btn1',
              text: '📋 О нас',
              buttonType: 'inline',
              callbackData: 'about',
              url: '',
            },
            {
              id: 'btn2',
              text: '💬 Поддержка',
              buttonType: 'inline',
              callbackData: 'support',
              url: '',
            },
            {
              id: 'btn3',
              text: '⚙️ Настройки',
              buttonType: 'inline',
              callbackData: 'settings',
              url: '',
            },
          ],
          layout: 'vertical',
        },
      },
      {
        id: 'tut-cmd-help',
        type: 'command',
        position: { x: 500, y: 40 },
        data: { command: '/help', description: 'Справка' },
      },
      {
        id: 'tut-msg-help',
        type: 'message',
        position: { x: 500, y: 160 },
        data: {
          text: 'Доступные команды:\n/start — запуск бота\n/help — эта справка',
          parseMode: 'HTML',
        },
      },
    ],
    edges: [
      {
        id: 'tut-e1',
        source: 'tut-cmd-start',
        target: 'tut-msg-welcome',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e3',
        source: 'tut-msg-welcome',
        target: 'tut-btns-main',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e2',
        source: 'tut-cmd-help',
        target: 'tut-msg-help',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'button-response',
    title: 'Обработка нажатий кнопок',
    icon: <MousePointerClick size={20} />,
    description:
      'Когда пользователь нажимает кнопку, бот получает её callback data. Используйте блок «Условие» с типом «Callback =», чтобы определить, какая кнопка нажата, и отправить соответствующий ответ.',
    details: [
      'Подключите блок «Условие» после блока «Кнопки».',
      'В условии выберите тип «Callback =» и укажите значение callback data кнопки.',
      'К выходу «Да» подключите сообщение-ответ для этой кнопки.',
      'К выходу «Нет» подключите другое условие для проверки следующей кнопки.',
    ],
    tip: 'Callback data кнопки и значение в условии должны совпадать точно — иначе бот не распознает нажатие.',
    nodes: [
      {
        id: 'tut-cmd-start',
        type: 'command',
        position: { x: 250, y: 40 },
        data: { command: '/start', description: 'Запустить бота' },
      },
      {
        id: 'tut-msg-welcome',
        type: 'message',
        position: { x: 250, y: 160 },
        data: {
          text: 'Привет! Я LiveBot — твой помощник. Чем могу помочь?',
          parseMode: 'HTML',
        },
      },
      {
        id: 'tut-btns-main',
        type: 'buttons',
        position: { x: 250, y: 300 },
        data: {
          buttons: [
            {
              id: 'btn1',
              text: '📋 О нас',
              buttonType: 'inline',
              callbackData: 'about',
              url: '',
            },
            {
              id: 'btn2',
              text: '💬 Поддержка',
              buttonType: 'inline',
              callbackData: 'support',
              url: '',
            },
            {
              id: 'btn3',
              text: '⚙️ Настройки',
              buttonType: 'inline',
              callbackData: 'settings',
              url: '',
            },
          ],
          layout: 'vertical',
        },
      },
      {
        id: 'tut-cond-about',
        type: 'condition',
        position: { x: 100, y: 460 },
        data: { conditionType: 'callback_data', value: 'about' },
      },
      {
        id: 'tut-msg-about',
        type: 'message',
        position: { x: 20, y: 600 },
        data: {
          text: 'Мы — команда LiveBot. Создаём удобные инструменты для разработки ботов!',
          parseMode: 'HTML',
        },
      },
      {
        id: 'tut-cond-support',
        type: 'condition',
        position: { x: 370, y: 460 },
        data: { conditionType: 'callback_data', value: 'support' },
      },
      {
        id: 'tut-msg-support',
        type: 'message',
        position: { x: 290, y: 600 },
        data: {
          text: 'Напишите ваш вопрос, и мы ответим в ближайшее время!',
          parseMode: 'HTML',
        },
      },
      {
        id: 'tut-cmd-help',
        type: 'command',
        position: { x: 600, y: 40 },
        data: { command: '/help', description: 'Справка' },
      },
      {
        id: 'tut-msg-help',
        type: 'message',
        position: { x: 600, y: 160 },
        data: {
          text: 'Доступные команды:\n/start — запуск бота\n/help — эта справка',
          parseMode: 'HTML',
        },
      },
    ],
    edges: [
      {
        id: 'tut-e1',
        source: 'tut-cmd-start',
        target: 'tut-msg-welcome',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e3',
        source: 'tut-msg-welcome',
        target: 'tut-btns-main',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e4',
        source: 'tut-btns-main',
        target: 'tut-cond-about',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e5',
        source: 'tut-cond-about',
        sourceHandle: 'true',
        target: 'tut-msg-about',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e6',
        source: 'tut-cond-about',
        sourceHandle: 'false',
        target: 'tut-cond-support',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e7',
        source: 'tut-cond-support',
        sourceHandle: 'true',
        target: 'tut-msg-support',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e2',
        source: 'tut-cmd-help',
        target: 'tut-msg-help',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'condition',
    title: 'Блок «Условие»',
    icon: <GitBranch size={20} />,
    description:
      'Условие проверяет текст или callback данные от пользователя и направляет поток по одному из двух путей: «Да» (условие выполнено) или «Нет» (не выполнено).',
    details: [
      'Хотите по-разному отвечать на разные слова? Используйте условие «Текст =» или «Текст содержит».',
      '«Текст =» — точное совпадение: пользователь должен написать ровно то, что указано.',
      '«Текст содержит» — частичное совпадение: слово или фраза должна быть в сообщении.',
      '«Callback =» — для обработки нажатий inline-кнопок.',
      'У условия два выхода: зелёный «Да» (слева) и красный «Нет» (справа).',
    ],
    tip: 'Можно «цеплять» условия друг за друга (Нет → следующее условие), чтобы проверить несколько вариантов.',
  },
  {
    id: 'broadcast',
    title: 'Блок «Рассылка»',
    icon: <Radio size={20} />,
    description:
      'Рассылка отправляет одно и то же сообщение всем пользователям бота. Используйте для объявлений, новостей и уведомлений.',
    details: [
      'Хотите уведомить всех пользователей? Добавьте блок «Рассылка» и введите текст.',
      'Рассылку можно подключить к команде — например, /broadcast для админов.',
      'Будьте осторожны с частотой: слишком частые рассылки могут раздражать пользователей.',
    ],
    tip: 'В реальном боте рассылка отправляется только при запуске сценария. В симуляторе она показывается как обычное сообщение с пометкой [Рассылка].',
    nodes: [
      {
        id: 'tut-cmd-start',
        type: 'command',
        position: { x: 250, y: 40 },
        data: { command: '/start', description: 'Запустить бота' },
      },
      {
        id: 'tut-msg-welcome',
        type: 'message',
        position: { x: 250, y: 160 },
        data: {
          text: 'Привет! Я LiveBot — твой помощник. Чем могу помочь?',
          parseMode: 'HTML',
        },
      },
      {
        id: 'tut-btns-main',
        type: 'buttons',
        position: { x: 250, y: 300 },
        data: {
          buttons: [
            {
              id: 'btn1',
              text: '📋 О нас',
              buttonType: 'inline',
              callbackData: 'about',
              url: '',
            },
            {
              id: 'btn2',
              text: '💬 Поддержка',
              buttonType: 'inline',
              callbackData: 'support',
              url: '',
            },
            {
              id: 'btn3',
              text: '⚙️ Настройки',
              buttonType: 'inline',
              callbackData: 'settings',
              url: '',
            },
          ],
          layout: 'vertical',
        },
      },
      {
        id: 'tut-cond-about',
        type: 'condition',
        position: { x: 100, y: 460 },
        data: { conditionType: 'callback_data', value: 'about' },
      },
      {
        id: 'tut-msg-about',
        type: 'message',
        position: { x: 20, y: 600 },
        data: {
          text: 'Мы — команда LiveBot. Создаём удобные инструменты для разработки ботов!',
          parseMode: 'HTML',
        },
      },
      {
        id: 'tut-cond-support',
        type: 'condition',
        position: { x: 370, y: 460 },
        data: { conditionType: 'callback_data', value: 'support' },
      },
      {
        id: 'tut-msg-support',
        type: 'message',
        position: { x: 290, y: 600 },
        data: {
          text: 'Напишите ваш вопрос, и мы ответим в ближайшее время!',
          parseMode: 'HTML',
        },
      },
      {
        id: 'tut-cmd-help',
        type: 'command',
        position: { x: 600, y: 40 },
        data: { command: '/help', description: 'Справка' },
      },
      {
        id: 'tut-msg-help',
        type: 'message',
        position: { x: 600, y: 160 },
        data: {
          text: 'Доступные команды:\n/start — запуск бота\n/help — эта справка',
          parseMode: 'HTML',
        },
      },
      {
        id: 'tut-cmd-broadcast',
        type: 'command',
        position: { x: 820, y: 40 },
        data: { command: '/broadcast', description: 'Рассылка' },
      },
      {
        id: 'tut-broadcast',
        type: 'broadcast',
        position: { x: 820, y: 160 },
        data: {
          message: 'Внимание! У нас новые функции — попробуйте /start',
          parseMode: 'HTML',
        },
      },
    ],
    edges: [
      {
        id: 'tut-e1',
        source: 'tut-cmd-start',
        target: 'tut-msg-welcome',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e3',
        source: 'tut-msg-welcome',
        target: 'tut-btns-main',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e4',
        source: 'tut-btns-main',
        target: 'tut-cond-about',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e5',
        source: 'tut-cond-about',
        sourceHandle: 'true',
        target: 'tut-msg-about',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e6',
        source: 'tut-cond-about',
        sourceHandle: 'false',
        target: 'tut-cond-support',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e7',
        source: 'tut-cond-support',
        sourceHandle: 'true',
        target: 'tut-msg-support',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e2',
        source: 'tut-cmd-help',
        target: 'tut-msg-help',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'tut-e8',
        source: 'tut-cmd-broadcast',
        target: 'tut-broadcast',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'simulator',
    title: 'Тестирование в симуляторе',
    icon: <TestTube size={20} />,
    description:
      'Симулятор позволяет протестировать бота прямо в браузере, без подключения к Telegram. Попробуйте отправить команды и нажать кнопки!',
    details: [
      'Введите /start в симуляторе справа внизу и отправьте — бот ответит приветствием с кнопками.',
      'Нажмите на кнопку «📋 О нас» — бот отправит информацию о себе.',
      'Попробуйте /help — получите список команд.',
      'Попробуйте /broadcast — увидите сообщение рассылки.',
      'Симулятор работает по тем же правилам, что и реальный Telegram-бот.',
    ],
    tip: 'После тестирования в симуляторе можно подключить реального бота через токен и запустить его для настоящих пользователей.',
  },
  {
    id: 'complete',
    title: 'Обучение завершено!',
    icon: <PartyPopper size={20} />,
    description:
      'Поздравляем! Вы познакомились со всеми основными функциями LiveBot Builder. Теперь вы можете создавать собственных ботов.',
    details: [
      'Создайте проект на главной странице и подключите токен бота от @BotFather.',
      'Перетаскивайте блоки из палитры на холст и соединяйте их стрелками.',
      'Тестируйте в симуляторе перед запуском.',
      'Нажмите «Запустить», чтобы бот начал отвечать реальным пользователям.',
      'Экспортируйте конфигурацию в JSON для бэкапа или переноса.',
    ],
    tip: 'Вы всегда можете пройти обучение заново с главной страницы.',
  },
];

export function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const setView = useProjectStore((s) => s.setView);
  const setNodes = useFlowStore((s) => s.setNodes);
  const setEdges = useFlowStore((s) => s.setEdges);
  const clearMessages = useSimulatorStore((s) => s.clearMessages);

  const step = TUTORIAL_STEPS[currentStep];

  const applyStep = useCallback(
    (stepIndex: number) => {
      const s = TUTORIAL_STEPS[stepIndex];
      if (s.nodes) {
        setNodes(s.nodes);
      }
      if (s.edges) {
        setEdges(s.edges);
      }
    },
    [setNodes, setEdges]
  );

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      applyStep(nextStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      applyStep(prevStep);
    }
  };

  const handleGoToStep = (idx: number) => {
    setCurrentStep(idx);
    applyStep(idx);
  };

  const handleFinish = () => {
    setNodes([]);
    setEdges([]);
    clearMessages();
    setView('projects');
  };

  const handleExit = () => {
    setNodes([]);
    setEdges([]);
    clearMessages();
    setView('projects');
  };

  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen">
        {/* Tutorial header */}
        <header className="h-12 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 text-[var(--color-text-secondary)] text-xs hover:text-[var(--color-text)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Выйти
            </button>
            <div className="w-px h-5 bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <GraduationCap
                size={16}
                className="text-[var(--color-primary)]"
              />
              <span className="text-sm font-semibold text-[var(--color-text)]">
                Обучение
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)]">
              Шаг {currentStep + 1} из {TUTORIAL_STEPS.length}
            </span>
            <div className="flex gap-1">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? 'bg-[var(--color-primary)] w-5'
                      : idx < currentStep
                        ? 'bg-[var(--color-primary)]/40'
                        : 'bg-[var(--color-border)]'
                  }`}
                  onClick={() => handleGoToStep(idx)}
                />
              ))}
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Tutorial content */}
          <div className="w-[380px] min-w-[380px] bg-white border-r border-[var(--color-border)] flex flex-col">
            {/* Step navigation */}
            <div className="flex-1 overflow-y-auto">
              {/* Step header */}
              <div className="p-5 pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    {step.icon}
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                      Шаг {currentStep + 1}
                    </div>
                    <h2 className="text-base font-bold text-[var(--color-text)]">
                      {step.title}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  {step.description}
                </p>
              </div>

              {/* Details list */}
              <div className="px-5 pb-4">
                <div className="flex flex-col gap-2.5">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-[var(--color-text)] leading-relaxed">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip */}
              {step.tip && (
                <div className="mx-5 mb-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-semibold">Совет: </span>
                    {step.tip}
                  </p>
                </div>
              )}

              {/* Step list for navigation */}
              <div className="px-5 pb-4">
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-2">
                  Содержание
                </div>
                <div className="flex flex-col gap-0.5">
                  {TUTORIAL_STEPS.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => handleGoToStep(idx)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        idx === currentStep
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                          : idx < currentStep
                            ? 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'
                            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]'
                      }`}
                    >
                      {idx < currentStep ? (
                        <CheckCircle2
                          size={13}
                          className="text-emerald-500 shrink-0"
                        />
                      ) : (
                        <span
                          className={`w-[13px] text-center shrink-0 ${idx === currentStep ? 'font-bold' : ''}`}
                        >
                          {idx + 1}
                        </span>
                      )}
                      <span className="truncate">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="p-4 border-t border-[var(--color-border)] flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-medium hover:bg-[var(--color-surface-alt)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                Назад
              </button>
              <div className="flex-1" />
              {isLastStep ? (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  Завершить обучение
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer"
                >
                  Далее
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Center: Flow canvas */}
          <div className="flex-1 flex flex-col">
            <FlowEditor />
          </div>

          {/* Right: Simulator */}
          <div className="w-[300px] min-w-[300px] bg-white border-l border-[var(--color-border)] flex flex-col">
            <ChatSimulator />
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
