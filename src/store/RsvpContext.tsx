import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { Envelope, Persistence, StorageAdapter } from '@/utils/storage';
import { CommunityEvent } from '@/types';
type Pending = { request: number; previous?: CommunityEvent };
export type RsvpState = {
  status: 'loading' | 'ready' | 'error';
  joined: Record<string, CommunityEvent>;
  pending: Record<string, Pending>;
  errors: Record<string, string>;
  error?: string;
};
export const initialState: RsvpState = {
  status: 'loading',
  joined: {},
  pending: {},
  errors: {},
};
type Action =
  | { type: 'hydrate'; envelope: Envelope }
  | { type: 'error'; message: string }
  | { type: 'loading' }
  | { type: 'request'; event: CommunityEvent; joined: boolean; request: number }
  | { type: 'settle'; id: string; request: number; error?: string };
export function rsvpReducer(state: RsvpState, action: Action): RsvpState {
  switch (action.type) {
    case 'loading':
      return { ...state, status: 'loading', error: undefined };
    case 'hydrate':
      return {
        ...initialState,
        status: 'ready',
        joined: action.envelope.rsvps,
      };
    case 'error':
      return { ...state, status: 'error', error: action.message };
    case 'request': {
      const joined = { ...state.joined },
        errors = { ...state.errors };
      if (action.joined) joined[action.event.id] = action.event;
      else delete joined[action.event.id];
      delete errors[action.event.id];
      return {
        ...state,
        joined,
        errors,
        pending: {
          ...state.pending,
          [action.event.id]: {
            request: action.request,
            previous: state.joined[action.event.id],
          },
        },
      };
    }
    case 'settle': {
      const operation = state.pending[action.id];
      if (!operation || operation.request !== action.request) return state;
      const pending = { ...state.pending },
        joined = { ...state.joined },
        errors = { ...state.errors };
      delete pending[action.id];
      if (action.error) {
        if (operation.previous) joined[action.id] = operation.previous;
        else delete joined[action.id];
        errors[action.id] = action.error;
      }
      return { ...state, joined, pending, errors };
    }
  }
}
const StateContext = createContext<RsvpState | null>(null);
const ActionsContext = createContext<{
  toggle(event: CommunityEvent): Promise<void>;
  retry(): void;
} | null>(null);
export function RsvpProvider({
  children,
  storage = AsyncStorage,
  now = Date.now,
}: {
  children: ReactNode;
  storage?: StorageAdapter;
  now?: () => number;
}) {
  const [state, dispatch] = useReducer(rsvpReducer, initialState);
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);
  const persistence = useMemo(
    () => new Persistence(storage, now),
    [storage, now],
  );
  const guards = useRef(new Set<string>()),
    sequence = useRef(0),
    generation = useRef(0);
  const hydrate = useCallback(() => {
    const token = ++generation.current;
    dispatch({ type: 'loading' });
    void persistence.hydrate().then(
      (envelope) => {
        if (generation.current === token)
          dispatch({ type: 'hydrate', envelope });
      },
      () => {
        if (generation.current === token)
          dispatch({
            type: 'error',
            message:
              'Could not restore saved events. Your data has been preserved. Check available storage and try again.',
          });
      },
    );
  }, [persistence]);
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);
  useEffect(() => {
    hydrate();
    return invalidate;
  }, [hydrate, invalidate]);
  const toggle = useCallback(
    async (event: CommunityEvent) => {
      const current = stateRef.current;
      if (current.status !== 'ready' || guards.current.has(event.id)) return;
      guards.current.add(event.id);
      const request = ++sequence.current,
        token = generation.current,
        joined = !current.joined[event.id];
      dispatch({ type: 'request', event, joined, request });
      try {
        await persistence.save(event, joined);
        if (token === generation.current)
          dispatch({ type: 'settle', id: event.id, request });
      } catch {
        if (token === generation.current)
          dispatch({
            type: 'settle',
            id: event.id,
            request,
            error: 'Your RSVP could not be saved. Please try again.',
          });
      } finally {
        guards.current.delete(event.id);
      }
    },
    [persistence],
  );
  const actions = useMemo(
    () => ({ toggle, retry: hydrate }),
    [toggle, hydrate],
  );
  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  );
}
export function useRsvps() {
  const value = useContext(StateContext);
  if (!value) throw new Error('Missing RSVP provider');
  return value;
}
export function useRsvpActions() {
  const value = useContext(ActionsContext);
  if (!value) throw new Error('Missing RSVP provider');
  return value;
}
