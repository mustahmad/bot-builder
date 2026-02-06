import type { Node, Edge } from '@xyflow/react';
import type { SimMessage, ButtonItem, TelegramUpdate } from '../types/index.ts';
import * as telegramApi from './telegramApi.ts';

export interface VariableAssignment {
  name: string;
  value: string;
}

export interface SimulationResult {
  messages: SimMessage[];
  pendingInputNodeId: string | null;
  variableAssignments: VariableAssignment[];
}

// Interpolate variables in text: {{varName}} -> value
function interpolateVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    return variables[varName] ?? `{{${varName}}}`;
  });
}

// Find a command node matching the input
function findCommandNode(nodes: Node[], command: string): Node | undefined {
  return nodes.find(
    (n) => n.type === 'command' && (n.data as Record<string, unknown>).command === command
  );
}

// Find nodes connected from a given source
function findNextNodes(
  nodes: Node[],
  edges: Edge[],
  sourceId: string,
  sourceHandle?: string
): Node[] {
  const outEdges = edges.filter(
    (e) =>
      e.source === sourceId &&
      (!sourceHandle || e.sourceHandle === sourceHandle)
  );
  return outEdges
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter((n): n is Node => n !== undefined);
}

// Process a flow starting from a given node
function processFlow(
  startNode: Node,
  nodes: Node[],
  edges: Edge[],
  userInput?: string,
  variables: Record<string, string> = {}
): SimulationResult {
  const messages: SimMessage[] = [];
  const variableAssignments: VariableAssignment[] = [];
  const visited = new Set<string>();
  const queue: Node[] = [startNode];

  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    if (visited.has(currentNode.id)) continue;
    visited.add(currentNode.id);

    const data = currentNode.data as Record<string, unknown>;
    const nextNodes = findNextNodes(nodes, edges, currentNode.id);

    switch (currentNode.type) {
      case 'command': {
        queue.push(...nextNodes);
        break;
      }

      case 'message': {
        const rawText = (data.text as string) || '(пустое сообщение)';
        const text = interpolateVariables(rawText, variables);
        // Check if next node is a buttons node to attach buttons
        const buttonNode = nextNodes.find((n) => n.type === 'buttons');
        const otherNext = nextNodes.filter((n) => n.type !== 'buttons');

        const buttons = buttonNode
          ? ((buttonNode.data as Record<string, unknown>).buttons as ButtonItem[])
          : undefined;

        messages.push({
          id: crypto.randomUUID(),
          sender: 'bot',
          text,
          buttons: buttons && buttons.length > 0 ? buttons : undefined,
          timestamp: Date.now(),
        });

        // If there's a button node, also follow its outgoing edges
        if (buttonNode) {
          const btnNext = findNextNodes(nodes, edges, buttonNode.id);
          // Don't auto-follow button edges - they need user interaction
          // But follow non-callback button edges
          queue.push(
            ...btnNext.filter((n) => n.type !== 'condition')
          );
        }
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
          else if (condType === 'text_contains')
            match = userInput.includes(condValue);
          else if (condType === 'callback_data')
            match = userInput === condValue;
        }

        const trueNodes = findNextNodes(nodes, edges, currentNode.id, 'true');
        const falseNodes = findNextNodes(
          nodes,
          edges,
          currentNode.id,
          'false'
        );

        queue.push(...(match ? trueNodes : falseNodes));
        break;
      }

      case 'broadcast': {
        const rawMsg = (data.message as string) || '(пусто)';
        const broadcastMsg = interpolateVariables(rawMsg, variables);
        messages.push({
          id: crypto.randomUUID(),
          sender: 'bot',
          text: `[Рассылка] ${broadcastMsg}`,
          timestamp: Date.now(),
        });
        queue.push(...nextNodes);
        break;
      }

      case 'image': {
        const imageUrl = (data.imageUrl as string) || '';
        const rawCaption = (data.caption as string) || '';
        const caption = interpolateVariables(rawCaption, variables);
        const display = caption
          ? `[Изображение] ${caption}`
          : `[Изображение: ${imageUrl || 'нет URL'}]`;
        messages.push({
          id: crypto.randomUUID(),
          sender: 'bot',
          text: display,
          timestamp: Date.now(),
        });
        queue.push(...nextNodes);
        break;
      }

      case 'delay': {
        const seconds = (data.delaySeconds as number) ?? 3;
        const showTyping = (data.showTyping as boolean) ?? true;
        messages.push({
          id: crypto.randomUUID(),
          sender: 'bot',
          text: `[Задержка ${seconds} сек.${showTyping ? ' — печатает...' : ''}]`,
          timestamp: Date.now(),
        });
        queue.push(...nextNodes);
        break;
      }

      case 'apiRequest': {
        const method = (data.method as string) || 'GET';
        const url = (data.url as string) || '(нет URL)';
        const responseVar = (data.responseVariable as string) || '';
        messages.push({
          id: crypto.randomUUID(),
          sender: 'bot',
          text: `[API: ${method} ${url}]${responseVar ? ` → ${responseVar}` : ''}`,
          timestamp: Date.now(),
        });
        // In simulator, always follow success path
        const successNodes = findNextNodes(nodes, edges, currentNode.id, 'success');
        queue.push(...successNodes);
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
        // Pause processing — wait for user input
        return { messages, pendingInputNodeId: currentNode.id, variableAssignments };
      }
    }
  }

  return { messages, pendingInputNodeId: null, variableAssignments };
}

// Simulate user command or text input
export function simulateInput(
  input: string,
  nodes: Node[],
  edges: Edge[],
  variables: Record<string, string> = {}
): SimulationResult {
  if (input.startsWith('/')) {
    const commandNode = findCommandNode(nodes, input);
    if (commandNode) {
      return processFlow(commandNode, nodes, edges, input, variables);
    }
    return {
      messages: [
        {
          id: crypto.randomUUID(),
          sender: 'bot',
          text: `Неизвестная команда: ${input}`,
          timestamp: Date.now(),
        },
      ],
      pendingInputNodeId: null,
      variableAssignments: [],
    };
  }

  // For non-command text, check condition nodes
  const conditionNodes = nodes.filter((n) => n.type === 'condition');
  for (const condNode of conditionNodes) {
    const data = condNode.data as Record<string, unknown>;
    const condType = data.conditionType as string;
    const condValue = data.value as string;
    let match = false;

    if (condType === 'text_equals') match = input === condValue;
    else if (condType === 'text_contains') match = input.includes(condValue);

    if (match) {
      return processFlow(condNode, nodes, edges, input, variables);
    }
  }

  return { messages: [], pendingInputNodeId: null, variableAssignments: [] };
}

// Simulate a button click
export function simulateButtonClick(
  callbackData: string,
  nodes: Node[],
  edges: Edge[],
  variables: Record<string, string> = {}
): SimulationResult {
  const variableAssignments: VariableAssignment[] = [];

  for (const node of nodes) {
    if (node.type === 'buttons') {
      const data = node.data as Record<string, unknown>;
      const buttons = data.buttons as ButtonItem[];
      const btn = buttons?.find((b) => b.callbackData === callbackData);
      if (btn) {
        // Save button text to variable if saveToVariable is set
        const saveToVariable = data.saveToVariable as string;
        if (saveToVariable) {
          variableAssignments.push({
            name: saveToVariable,
            value: btn.text,
          });
          // Update variables for subsequent processing
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
export function continueFromInputWait(
  nodeId: string,
  userInput: string,
  nodes: Node[],
  edges: Edge[],
  variables: Record<string, string> = {}
): SimulationResult {
  const variableAssignments: VariableAssignment[] = [];

  // Find the inputWait node and save input to variable if configured
  const inputNode = nodes.find((n) => n.id === nodeId);
  if (inputNode && inputNode.type === 'inputWait') {
    const data = inputNode.data as Record<string, unknown>;
    const variableName = data.variableName as string;
    if (variableName) {
      variableAssignments.push({
        name: variableName,
        value: userInput,
      });
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

// Deploy bot: register commands with Telegram
export async function deployBot(
  token: string,
  nodes: Node[]
): Promise<void> {
  const commandNodes = nodes.filter((n) => n.type === 'command');
  const commands = commandNodes.map((n) => {
    const data = n.data as Record<string, unknown>;
    return {
      command: (data.command as string).replace('/', ''),
      description: (data.description as string) || 'Без описания',
    };
  });

  if (commands.length > 0) {
    await telegramApi.setMyCommands(token, commands);
  }
}

// Handle an incoming Telegram update
export function handleUpdate(
  update: TelegramUpdate,
  nodes: Node[],
  edges: Edge[],
  token: string
): void {
  if (update.message?.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    const { messages: responses } = simulateInput(text, nodes, edges);

    for (const response of responses) {
      let replyMarkup: unknown = undefined;

      if (response.buttons && response.buttons.length > 0) {
        const inlineButtons = response.buttons.filter(
          (b: ButtonItem) => b.buttonType === 'inline'
        );
        const replyButtons = response.buttons.filter(
          (b: ButtonItem) => b.buttonType === 'reply'
        );

        if (inlineButtons.length > 0) {
          replyMarkup = {
            inline_keyboard: inlineButtons.map((b: ButtonItem) => [
              {
                text: b.text,
                callback_data: b.callbackData || b.text,
                url: b.url || undefined,
              },
            ]),
          };
        } else if (replyButtons.length > 0) {
          replyMarkup = {
            keyboard: replyButtons.map((b: ButtonItem) => [{ text: b.text }]),
            resize_keyboard: true,
          };
        }
      }

      telegramApi
        .sendMessage(token, chatId, response.text, {
          replyMarkup,
        })
        .catch(console.error);
    }
  }

  if (update.callback_query) {
    const chatId = update.callback_query.message?.chat?.id;
    const callbackData = update.callback_query.data;

    telegramApi
      .answerCallbackQuery(token, update.callback_query.id)
      .catch(console.error);

    if (chatId && callbackData) {
      const { messages: responses } = simulateButtonClick(callbackData, nodes, edges);
      for (const response of responses) {
        telegramApi
          .sendMessage(token, chatId, response.text)
          .catch(console.error);
      }
    }
  }
}
