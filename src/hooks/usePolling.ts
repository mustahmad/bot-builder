import { useEffect, useRef, useCallback } from 'react';
import { useBotStore } from '../store/botStore.ts';
import { useFlowStore } from '../store/flowStore.ts';
import * as telegramApi from '../services/telegramApi.ts';
import { handleUpdate } from '../services/botEngine.ts';

export function usePolling() {
  const token = useBotStore((s) => s.token);
  const pollingActive = useBotStore((s) => s.pollingActive);
  const setPollingActive = useBotStore((s) => s.setPollingActive);
  const setError = useBotStore((s) => s.setError);

  const offsetRef = useRef<number | undefined>(undefined);
  const abortRef = useRef(false);

  const poll = useCallback(async () => {
    if (!token) return;
    abortRef.current = false;

    while (!abortRef.current) {
      try {
        const updates = await telegramApi.getUpdates(
          token,
          offsetRef.current,
          25
        );

        if (abortRef.current) break;

        const { nodes, edges } = useFlowStore.getState();

        for (const update of updates) {
          handleUpdate(update, nodes, edges, token);
          offsetRef.current = update.update_id + 1;
        }
      } catch (err) {
        if (abortRef.current) break;
        const msg = err instanceof Error ? err.message : 'Polling error';
        setError(msg);
        // Wait before retrying
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }, [token, setError]);

  const startPolling = useCallback(() => {
    setPollingActive(true);
    setError(null);
    poll();
  }, [poll, setPollingActive, setError]);

  const stopPolling = useCallback(() => {
    abortRef.current = true;
    setPollingActive(false);
  }, [setPollingActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  return { pollingActive, startPolling, stopPolling };
}
