import {
  categories,
  CommunityEvent,
  EventDetail,
  Host,
  HostProfile,
  Person,
} from '@/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
export const validId = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(v);
function validDate(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(v) &&
    Number.isFinite(Date.parse(v))
  );
}
export function isEvent(value: unknown): value is CommunityEvent {
  if (!isRecord(value)) return false;
  const e = value;
  if (e.timeZone !== undefined) {
    if (typeof e.timeZone !== 'string') return false;
    try {
      new Intl.DateTimeFormat('en', { timeZone: e.timeZone }).format();
    } catch {
      return false;
    }
  }
  return (
    validId(e.id) &&
    typeof e.title === 'string' &&
    e.title.trim().length > 0 &&
    categories.some((c) => c === e.category) &&
    validDate(e.startsAt) &&
    (e.endsAt === undefined ||
      (validDate(e.endsAt) && Date.parse(e.endsAt) > Date.parse(e.startsAt))) &&
    typeof e.location === 'string' &&
    validId(e.hostId) &&
    (e.hostName === undefined || typeof e.hostName === 'string') &&
    (e.imageUrl === undefined || typeof e.imageUrl === 'string') &&
    typeof e.baseAttendeeCount === 'number' &&
    Number.isSafeInteger(e.baseAttendeeCount) &&
    e.baseAttendeeCount >= 0 &&
    (e.description === undefined || typeof e.description === 'string') &&
    (e.attendeePreviewIds === undefined ||
      (Array.isArray(e.attendeePreviewIds) &&
        e.attendeePreviewIds.every(validId)))
  );
}

function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error('Invalid API object.');
  return value;
}
function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error('Invalid API text.');
  return value;
}
function id(value: unknown): string {
  if (!validId(value)) throw new Error('Invalid API identifier.');
  return value;
}
function image(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const uri = text(value);
  if (!/^https?:\/\//.test(uri)) throw new Error('Invalid image URL.');
  return uri;
}
function parseSummary(value: unknown): CommunityEvent {
  const e = record(value),
    category = categories.find((c) => c === e.category);
  if (
    !category ||
    !validDate(e.date) ||
    typeof e.attendeeCount !== 'number' ||
    !Number.isSafeInteger(e.attendeeCount) ||
    e.attendeeCount < 0
  )
    throw new Error('Invalid event summary.');
  if (
    e.endDate !== undefined &&
    (!validDate(e.endDate) || Date.parse(e.endDate) <= Date.parse(e.date))
  )
    throw new Error('Invalid end time.');
  const timeZone = e.timeZone === undefined ? undefined : text(e.timeZone);
  if (timeZone) new Intl.DateTimeFormat('en', { timeZone }).format();
  return {
    id: id(e.id),
    title: text(e.title),
    category,
    startsAt: e.date,
    endsAt: typeof e.endDate === 'string' ? e.endDate : undefined,
    timeZone,
    location: text(e.location),
    hostId: id(e.hostId),
    hostName: text(e.hostName),
    imageUrl: image(e.imageUrl),
    baseAttendeeCount: e.attendeeCount,
  };
}
function unique<T extends { id: string }>(items: T[]): T[] {
  if (new Set(items.map((i) => i.id)).size !== items.length)
    throw new Error('Duplicate API identifiers.');
  return items;
}
export function parseEvents(value: unknown): CommunityEvent[] {
  if (!Array.isArray(value)) throw new Error('Invalid event list.');
  return unique(value.map(parseSummary));
}
function person(value: unknown): Person {
  const p = record(value);
  return { id: id(p.id), name: text(p.name), avatarUrl: image(p.avatarUrl) };
}
function host(value: unknown): Host {
  return { ...person(value), bio: text(record(value).bio) };
}
export function parseDetail(value: unknown): EventDetail {
  const e = record(value),
    summary = parseSummary(value),
    profile = host(e.host);
  if (
    profile.id !== summary.hostId ||
    profile.name !== summary.hostName ||
    !Array.isArray(e.attendeePreview)
  )
    throw new Error('Invalid event relationships.');
  const preview = unique(e.attendeePreview.map(person));
  if (
    preview.some((p) => p.id === 'me') ||
    preview.length > summary.baseAttendeeCount
  )
    throw new Error('Invalid attendee preview.');
  return {
    ...summary,
    description: text(e.description),
    host: profile,
    attendeePreview: preview,
  };
}
export function parseHost(value: unknown): HostProfile {
  const profile = host(value),
    events = parseEvents(record(value).events);
  if (
    events.some((e) => e.hostId !== profile.id || e.hostName !== profile.name)
  )
    throw new Error('Invalid hosted events.');
  return { ...profile, events };
}
