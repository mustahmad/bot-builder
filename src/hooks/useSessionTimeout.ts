import { useEffect, useRef, useCallback } from 'react';
import { useBotStore } from '../store/botStore.ts';
import { useFlowStore } from '../store/flowStore.ts';
import { useSimulatorStore } from '../store/simulatorStore.ts';

const SESSION_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

export function useSessionTimeout() {
  const disconnect = useBotStore((s) => s.disconnect);
  const clearFlow = useFlowStore((s) => s.clearFlow);
  const clearMessages = useSimulatorStore((s) => s.clearMessages);
  const isConnected = useBotStore((s) => s.isConnected);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!isConnected) return;

    timerRef.current = setTimeout(() => {
      disconnect();
      clearFlow();
      clearMessages();
      sessionStorage.clear();
    }, SESSION_TIMEOUT_MS);
  }, [isConnected, disconnect, clearFlow, clearMessages]);

  useEffect(() => {
    if (!isConnected) return;

    const events = ['mousedown', 'keydown', 'scroll', 'mousemove'];
    const handler = () => resetTimer();

    events.forEach((e) => window.addEventListener(e, handler));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isConnected, resetTimer]);

  // Clear data on tab close
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.clear();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
}
