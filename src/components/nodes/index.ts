import { CommandNode } from './CommandNode.tsx';
import { MessageNode } from './MessageNode.tsx';
import { ButtonsNode } from './ButtonsNode.tsx';
import { ConditionNode } from './ConditionNode.tsx';
import { BroadcastNode } from './BroadcastNode.tsx';
import { ImageNode } from './ImageNode.tsx';
import { DelayNode } from './DelayNode.tsx';
import { ApiRequestNode } from './ApiRequestNode.tsx';
import { InputWaitNode } from './InputWaitNode.tsx';

export const nodeTypes = {
  command: CommandNode,
  message: MessageNode,
  buttons: ButtonsNode,
  condition: ConditionNode,
  broadcast: BroadcastNode,
  image: ImageNode,
  delay: DelayNode,
  apiRequest: ApiRequestNode,
  inputWait: InputWaitNode,
};
