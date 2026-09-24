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
            error: 'Unable to load this content. Please try again.',
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
    warning: state.usingFallback
      ? 'Unable to load current data. Showing bundled demo data.'
      : undefined,
  };
}
