import { useEffect, useRef, useCallback, useState } from 'react';
import { useFlowStore } from '../store/flowStore.ts';
import { useProjectStore } from '../store/projectStore.ts';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DEBOUNCE_MS = 2000; // 2 seconds after last change
const SAVED_DISPLAY_MS = 3000; // show "saved" for 3 seconds

export function useAutoSave() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const saveProjectFlow = useProjectStore((s) => s.saveProjectFlow);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveCounterRef = useRef(0);
  const prevSnapshotRef = useRef<string>('');
  const [status, setStatus] = useState<SaveStatus>('idle');

  const save = useCallback(async () => {
    if (!activeProjectId) return;

    const { nodes, edges } = useFlowStore.getState();

    // Snapshot comparison to avoid unnecessary saves
    const snapshot = JSON.stringify({ nodes, edges });
    if (snapshot === prevSnapshotRef.current) return;

    const saveId = ++saveCounterRef.current;
    setStatus('saving');

    // saveProjectFlow saves to localStorage first (always succeeds),
    // then tries API (may fail). We consider save successful regardless.
    await saveProjectFlow(activeProjectId, nodes, edges);

    // Only update status if this is still the latest save
    if (saveId === saveCounterRef.current) {
      prevSnapshotRef.current = snapshot;
      setStatus('saved');
      setTimeout(() => {
        if (saveCounterRef.current === saveId) {
          setStatus('idle');
        }
      }, SAVED_DISPLAY_MS);
    }
  }, [activeProjectId, saveProjectFlow]);

  // Subscribe to flow store changes
  useEffect(() => {
    if (!activeProjectId) return;

    // Initialize the snapshot with current state
    const { nodes, edges } = useFlowStore.getState();
    prevSnapshotRef.current = JSON.stringify({ nodes, edges });

    const unsub = useFlowStore.subscribe((state, prevState) => {
      // Only trigger on actual node/edge changes, not selectedNodeId changes
      if (state.nodes === prevState.nodes && state.edges === prevState.edges) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(save, DEBOUNCE_MS);
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeProjectId, save]);

  // Save on beforeunload (best-effort)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        // Fire and forget -- may not complete but at most 2s of changes lost
        save();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [save]);

  // Force save function for explicit saves (e.g., before navigation)
  const forceSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await save();
  }, [save]);

  return { status, forceSave };
}
