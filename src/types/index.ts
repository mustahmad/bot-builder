import type { Node, Edge } from '@xyflow/react';

// ---- Node Data Types ----

export interface CommandNodeData extends Record<string, unknown> {
  command: string;
  description: string;
}

export interface MessageNodeData extends Record<string, unknown> {
  text: string;
  parseMode: 'HTML' | 'MarkdownV2';
}

export interface ButtonItem {
  id: string;
  text: string;
  buttonType: 'inline' | 'reply';
  callbackData: string;
  url: string;
}

export interface ButtonsNodeData extends Record<string, unknown> {
  buttons: ButtonItem[];
  layout: 'vertical' | 'horizontal';
}

export interface ConditionNodeData extends Record<string, unknown> {
  conditionType: 'text_equals' | 'text_contains' | 'callback_data';
  value: string;
}

export interface BroadcastNodeData extends Record<string, unknown> {
  message: string;
  parseMode: 'HTML' | 'MarkdownV2';
}

export interface ImageNodeData extends Record<string, unknown> {
  imageUrl: string;
  caption: string;
  parseMode: 'HTML' | 'MarkdownV2';
}

export interface DelayNodeData extends Record<string, unknown> {
  delaySeconds: number;
  showTyping: boolean;
}

export interface ApiRequestNodeData extends Record<string, unknown> {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: string;
  body: string;
  responseVariable: string;
}

export interface InputWaitNodeData extends Record<string, unknown> {
  promptText: string;
  variableName: string;
  validation: 'none' | 'email' | 'phone' | 'number';
  errorText: string;
}

export type BotNodeData =
  | CommandNodeData
  | MessageNodeData
  | ButtonsNodeData
  | ConditionNodeData
  | BroadcastNodeData
  | ImageNodeData
  | DelayNodeData
  | ApiRequestNodeData
  | InputWaitNodeData;

export type BotNode = Node<BotNodeData>;
export type BotEdge = Edge;

// ---- Telegram API Types ----

export interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    from?: { id: number; first_name: string; username?: string };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: { id: number; first_name: string };
    message?: {
      message_id: number;
      chat: { id: number };
    };
    data?: string;
  };
}

// ---- Simulator Types ----

export interface SimMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  buttons?: ButtonItem[];
  timestamp: number;
}

// ---- Export/Import ----

export interface BotConfig {
  version: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  exportedAt: string;
}

// ---- Block Palette ----

export interface BlockType {
  type: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  defaultData: Record<string, unknown>;
}
