import { strings } from '@/constants/strings';
import { FetchResult } from '@/types';
import { useCallback, useEffect, useState } from 'react';
export function useResource<T>(
  loader: (signal: AbortSignal) => Promise<FetchResult<T>>,
) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    data?: T;
    loading: boolean;
    error?: string;
    usingFallback?: boolean;
  }>({ loading: true });
  useEffect(() => {
    const controller = new AbortController();
    void loader(controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) setState({ ...result, loading: false });
      },
      () => {
        if (!controller.signal.aborted)
          setState((s) => ({
            ...s,
            loading: false,
            error: strings.errors.load,
          }));
      },
    );
    // Stop unfinished work when this screen unmounts or a new request replaces it.
    return () => controller.abort();
  }, [loader, attempt]);
  const retry = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    setAttempt((n) => n + 1);
  }, []);
  return {
    ...state,
    retry,
    warning: state.usingFallback ? strings.errors.fallback : undefined,
  };
}
