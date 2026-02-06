import type { BotInfo, TelegramUpdate } from '../types/index.ts';

const BASE_URL = 'https://api.telegram.org/bot';

export async function getMe(token: string): Promise<BotInfo> {
  const response = await fetch(`${BASE_URL}${token}/getMe`);
  const data = await response.json();
  if (!data.ok) throw new Error(data.description || 'Failed to get bot info');
  return data.result;
}

export async function sendMessage(
  token: string,
  chatId: number | string,
  text: string,
  options?: {
    parseMode?: string;
    replyMarkup?: unknown;
  }
): Promise<unknown> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };
  if (options?.parseMode) body.parse_mode = options.parseMode;
  if (options?.replyMarkup) body.reply_markup = options.replyMarkup;

  const response = await fetch(`${BASE_URL}${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.description || 'Failed to send message');
  return data.result;
}

export async function setMyCommands(
  token: string,
  commands: Array<{ command: string; description: string }>
): Promise<void> {
  const response = await fetch(`${BASE_URL}${token}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commands }),
  });
  const data = await response.json();
  if (!data.ok)
    throw new Error(data.description || 'Failed to set commands');
}

export async function getUpdates(
  token: string,
  offset?: number,
  timeout: number = 30
): Promise<TelegramUpdate[]> {
  const params = new URLSearchParams();
  if (offset !== undefined) params.set('offset', String(offset));
  params.set('timeout', String(timeout));

  const controller = new AbortController();
  const abortTimeout = setTimeout(
    () => controller.abort(),
    (timeout + 10) * 1000
  );

  try {
    const response = await fetch(
      `${BASE_URL}${token}/getUpdates?${params}`,
      { signal: controller.signal }
    );
    const data = await response.json();
    if (!data.ok)
      throw new Error(data.description || 'Failed to get updates');
    return data.result;
  } finally {
    clearTimeout(abortTimeout);
  }
}

export async function answerCallbackQuery(
  token: string,
  callbackQueryId: string,
  text?: string
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}${token}/answerCallbackQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    }
  );
  const data = await response.json();
  if (!data.ok)
    throw new Error(data.description || 'Failed to answer callback');
}

export async function setWebhook(
  token: string,
  url: string
): Promise<void> {
  const response = await fetch(`${BASE_URL}${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await response.json();
  if (!data.ok)
    throw new Error(data.description || 'Failed to set webhook');
}

export async function deleteWebhook(token: string): Promise<void> {
  const response = await fetch(`${BASE_URL}${token}/deleteWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!data.ok)
    throw new Error(data.description || 'Failed to delete webhook');
}
