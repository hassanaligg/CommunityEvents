import { CommunityEvent } from '@/types';
import { isEvent } from '@/utils/validation';
export const STORAGE_KEY = 'community-events:state:v1';
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export type Envelope = {
  version: 1;
  seed: string;
  rsvps: Record<string, CommunityEvent>;
};
export function parseEnvelope(raw: string): Envelope {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object')
    throw new Error('Saved data is invalid.');
  const e = value as Record<string, unknown>;
  if (
    e.version !== 1 ||
    typeof e.seed !== 'string' ||
    !Number.isFinite(Date.parse(e.seed)) ||
    !e.rsvps ||
    typeof e.rsvps !== 'object' ||
    Array.isArray(e.rsvps) ||
    !Object.entries(e.rsvps).every(
      ([id, event]) => isEvent(event) && id === event.id,
    )
  ) {
    throw new Error(
      'Saved data is invalid or uses an unsupported version. Your saved data has been preserved.',
    );
  }
  return e as Envelope;
}
// Each command starts with the last acknowledged envelope, never optimistic UI state.
export class Persistence {
  private durable?: Envelope;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(
    private storage: StorageAdapter,
    private now: () => number = Date.now,
  ) {}
  async hydrate(): Promise<Envelope> {
    const raw = await this.storage.getItem(STORAGE_KEY);
    const envelope =
      raw === null
        ? {
            version: 1 as const,
            seed: new Date(this.now()).toISOString(),
            rsvps: {},
          }
        : parseEnvelope(raw);
    if (raw === null)
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    this.durable = envelope;
    return envelope;
  }
  async reset(): Promise<Envelope> {
    const envelope: Envelope = {
      version: 1,
      seed: new Date(this.now()).toISOString(),
      rsvps: {},
    };
    await this.storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    this.durable = envelope;
    return envelope;
  }
  save(event: CommunityEvent, joined: boolean): Promise<void> {
    const command = this.queue.then(async () => {
      if (!this.durable)
        throw new Error('Restore saved events before making changes.');
      const rsvps = { ...this.durable.rsvps };
      if (joined) rsvps[event.id] = event;
      else delete rsvps[event.id];
      const next = { ...this.durable, rsvps };
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(next));
      this.durable = next;
    });
    this.queue = command.catch(() => undefined);
    return command;
  }
  sync(events: readonly CommunityEvent[]): Promise<CommunityEvent[]> {
    const command = this.queue.then(async () => {
      if (!this.durable)
        throw new Error('Restore saved events before refreshing.');
      const durable = this.durable;
      const updates = events.filter((event) => durable.rsvps[event.id]);
      const rsvps = { ...this.durable.rsvps };
      for (const event of updates) rsvps[event.id] = event;
      const next = { ...this.durable, rsvps };
      if (JSON.stringify(next) !== JSON.stringify(this.durable)) {
        await this.storage.setItem(STORAGE_KEY, JSON.stringify(next));
        this.durable = next;
      }
      return updates;
    });
    this.queue = command.catch(() => undefined);
    return command;
  }
}
