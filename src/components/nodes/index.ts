import { CommandNode } from './CommandNode.tsx';
import { MessageNode } from './MessageNode.tsx';
import { ButtonsNode } from './ButtonsNode.tsx';
import { ConditionNode } from './ConditionNode.tsx';
import { BroadcastNode } from './BroadcastNode.tsx';

export const nodeTypes = {
  command: CommandNode,
  message: MessageNode,
  buttons: ButtonsNode,
  condition: ConditionNode,
  broadcast: BroadcastNode,
};
