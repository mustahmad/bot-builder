import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// Types
interface ButtonItem {
  id: string;
  text: string;
  buttonType: 'inline' | 'reply';
  callbackData: string;
  url: string;
}

interface TelegramUpdate {
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

interface SimMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  buttons?: ButtonItem[];
  timestamp: number;
}

interface VariableAssignment {
  name: string;
  value: string;
}

interface SimulationResult {
  messages: SimMessage[];
  pendingInputNodeId: string | null;
  variableAssignments: VariableAssignment[];
}

interface FlowNode {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Chat state storage (per project, per chat)
interface ChatState {
  pendingInputNodeId: string | null;
  variables: Record<string, string>;
}
const chatStates = new Map<string, ChatState>();

function getChatStateKey(projectId: string, chatId: number): string {
  return `${projectId}:${chatId}`;
}

function getChatState(projectId: string, chatId: number): ChatState {
  const key = getChatStateKey(projectId, chatId);
  if (!chatStates.has(key)) {
    chatStates.set(key, { pendingInputNodeId: null, variables: {} });
  }
  return chatStates.get(key)!;
}

function updateChatState(projectId: string, chatId: number, result: SimulationResult): void {
  const state = getChatState(projectId, chatId);
  state.pendingInputNodeId = result.pendingInputNodeId;
  for (const va of result.variableAssignments) {
    state.variables[va.name] = va.value;
  }
}

// Interpolate variables in text: {{varName}} -> value
function interpolateVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    return variables[varName] ?? `{{${varName}}}`;
  });
}

// Find nodes connected from a given source
function findNextNodes(
  nodes: FlowNode[],
  edges: FlowEdge[],
  sourceId: string,
  sourceHandle?: string
): FlowNode[] {
  const outEdges = edges.filter(
    (e) =>
      e.source === sourceId &&
      (!sourceHandle || e.sourceHandle === sourceHandle)
  );
  return outEdges
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter((n): n is FlowNode => n !== undefined);
}

// Find a command node matching the input
function findCommandNode(nodes: FlowNode[], command: string): FlowNode | undefined {
  return nodes.find(
    (n) => n.type === 'command' && n.data.command === command
  );
}

// Process a flow starting from a given node
function processFlow(
  startNode: FlowNode,
  nodes: FlowNode[],
  edges: FlowEdge[],
  userInput?: string,
  variables: Record<string, string> = {}
): SimulationResult {
  const messages: SimMessage[] = [];
  const variableAssignments: VariableAssignment[] = [];
  const visited = new Set<string>();
  const queue: FlowNode[] = [startNode];

  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    if (visited.has(currentNode.id)) continue;
    visited.add(currentNode.id);

    const data = currentNode.data;
    const nextNodes = findNextNodes(nodes, edges, currentNode.id);

    switch (currentNode.type) {
      case 'command': {
        queue.push(...nextNodes);
        break;
      }

      case 'message': {
        const rawText = (data.text as string) || '(пустое сообщение)';
        const text = interpolateVariables(rawText, variables);
        const buttonNode = nextNodes.find((n) => n.type === 'buttons');

        const buttons = buttonNode
          ? (buttonNode.data.buttons as ButtonItem[])
          : undefined;

        messages.push({
          id: crypto.randomUUID(),
          sender: 'bot',
          text,
          buttons: buttons && buttons.length > 0 ? buttons : undefined,
          timestamp: Date.now(),
        });

        if (buttonNode) {
          break;
        }
        const otherNext = nextNodes.filter((n) => n.type !== 'buttons');
        queue.push(...otherNext);
        break;
      }

      case 'buttons': {
        const buttons = data.buttons as ButtonItem[];
        if (buttons && buttons.length > 0) {
          messages.push({
            id: crypto.randomUUID(),
            sender: 'bot',
            text: 'Выберите вариант:',
            buttons,
            timestamp: Date.now(),
          });
        }
        break;
      }

      case 'condition': {
        const condType = data.conditionType as string;
        const condValue = data.value as string;
        let match = false;

        if (userInput) {
          if (condType === 'text_equals') match = userInput === condValue;
          else if (condType === 'text_contains') match = userInput.includes(condValue);
          else if (condType === 'callback_data') match = userInput === condValue;
        }

        const trueNodes = findNextNodes(nodes, edges, currentNode.id, 'true');
        const falseNodes = findNextNodes(nodes, edges, currentNode.id, 'false');
        queue.push(...(match ? trueNodes : falseNodes));
        break;
      }

      case 'inputWait': {
        const rawPrompt = (data.promptText as string) || 'Ожидание ответа...';
        const promptText = interpolateVariables(rawPrompt, variables);
        messages.push({
          id: crypto.randomUUID(),
          sender: 'bot',
          text: promptText,
          timestamp: Date.now(),
        });
        return { messages, pendingInputNodeId: currentNode.id, variableAssignments };
      }
    }
  }

  return { messages, pendingInputNodeId: null, variableAssignments };
}

// Simulate user command or text input
function simulateInput(
  input: string,
  nodes: FlowNode[],
  edges: FlowEdge[],
  variables: Record<string, string> = {}
): SimulationResult {
  if (input.startsWith('/')) {
    const commandNode = findCommandNode(nodes, input);
    if (commandNode) {
      return processFlow(commandNode, nodes, edges, input, variables);
    }
    return {
      messages: [{
        id: crypto.randomUUID(),
        sender: 'bot',
        text: `Неизвестная команда: ${input}`,
        timestamp: Date.now(),
      }],
      pendingInputNodeId: null,
      variableAssignments: [],
    };
  }

  return { messages: [], pendingInputNodeId: null, variableAssignments: [] };
}

// Simulate a button click
function simulateButtonClick(
  callbackData: string,
  nodes: FlowNode[],
  edges: FlowEdge[],
  variables: Record<string, string> = {}
): SimulationResult {
  const variableAssignments: VariableAssignment[] = [];

  for (const node of nodes) {
    if (node.type === 'buttons') {
      const buttons = node.data.buttons as ButtonItem[];
      const btn = buttons?.find((b) => b.callbackData === callbackData);
      if (btn) {
        const saveToVariable = node.data.saveToVariable as string;
        if (saveToVariable) {
          variableAssignments.push({ name: saveToVariable, value: btn.text });
          variables = { ...variables, [saveToVariable]: btn.text };
        }

        const nextNodes = findNextNodes(nodes, edges, node.id);
        const allMessages: SimMessage[] = [];
        let pendingId: string | null = null;

        for (const next of nextNodes) {
          const result = processFlow(next, nodes, edges, callbackData, variables);
          allMessages.push(...result.messages);
          variableAssignments.push(...result.variableAssignments);
          if (result.pendingInputNodeId) pendingId = result.pendingInputNodeId;
        }
        return { messages: allMessages, pendingInputNodeId: pendingId, variableAssignments };
      }
    }
  }
  return { messages: [], pendingInputNodeId: null, variableAssignments: [] };
}

// Continue flow after user provides input for an inputWait node
function continueFromInputWait(
  nodeId: string,
  userInput: string,
  nodes: FlowNode[],
  edges: FlowEdge[],
  variables: Record<string, string> = {}
): SimulationResult {
  const variableAssignments: VariableAssignment[] = [];

  const inputNode = nodes.find((n) => n.id === nodeId);
  if (inputNode && inputNode.type === 'inputWait') {
    const variableName = inputNode.data.variableName as string;
    if (variableName) {
      variableAssignments.push({ name: variableName, value: userInput });
      variables = { ...variables, [variableName]: userInput };
    }
  }

  const nextNodes = findNextNodes(nodes, edges, nodeId);
  const allMessages: SimMessage[] = [];
  let pendingId: string | null = null;

  for (const next of nextNodes) {
    const result = processFlow(next, nodes, edges, userInput, variables);
    allMessages.push(...result.messages);
    variableAssignments.push(...result.variableAssignments);
    if (result.pendingInputNodeId) pendingId = result.pendingInputNodeId;
  }

  return { messages: allMessages, pendingInputNodeId: pendingId, variableAssignments };
}

// Telegram API helpers
async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  buttons?: ButtonItem[]
): Promise<void> {
  let replyMarkup: unknown = undefined;

  if (buttons && buttons.length > 0) {
    const inlineButtons = buttons.filter((b) => b.buttonType === 'inline');
    const replyButtons = buttons.filter((b) => b.buttonType === 'reply');

    if (inlineButtons.length > 0) {
      replyMarkup = {
        inline_keyboard: inlineButtons.map((b) => [{
          text: b.text,
          callback_data: b.callbackData || b.text,
          url: b.url || undefined,
        }]),
      };
    } else if (replyButtons.length > 0) {
      replyMarkup = {
        keyboard: replyButtons.map((b) => [{ text: b.text }]),
        resize_keyboard: true,
      };
    }
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function answerCallbackQuery(token: string, callbackQueryId: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}

// Webhook endpoint
router.post('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const update = req.body as TelegramUpdate;

  try {
    // Load project from database
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || !project.botToken) {
      return res.status(404).json({ error: 'Project not found or no bot token' });
    }

    const nodes = project.nodes as unknown as FlowNode[];
    const edges = project.edges as unknown as FlowEdge[];
    const token = project.botToken;

    // Handle text message
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const state = getChatState(projectId, chatId);

      let result: SimulationResult;

      if (state.pendingInputNodeId) {
        result = continueFromInputWait(
          state.pendingInputNodeId,
          text,
          nodes,
          edges,
          state.variables
        );
      } else {
        result = simulateInput(text, nodes, edges, state.variables);
      }

      updateChatState(projectId, chatId, result);

      for (const msg of result.messages) {
        await sendTelegramMessage(token, chatId, msg.text, msg.buttons);
      }
    }

    // Handle callback query (button click)
    if (update.callback_query) {
      const chatId = update.callback_query.message?.chat?.id;
      const callbackData = update.callback_query.data;

      await answerCallbackQuery(token, update.callback_query.id);

      if (chatId && callbackData) {
        const state = getChatState(projectId, chatId);
        const result = simulateButtonClick(callbackData, nodes, edges, state.variables);

        updateChatState(projectId, chatId, result);

        for (const msg of result.messages) {
          await sendTelegramMessage(token, chatId, msg.text, msg.buttons);
        }
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
