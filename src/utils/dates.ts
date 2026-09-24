import { CommunityEvent } from '@/types';
export const isUpcoming = (event: CommunityEvent, now: number) =>
  Date.parse(event.endsAt ?? event.startsAt) > now;
export const columnsForWidth = (width: number) => (width >= 768 ? 2 : 1);
export function formatDate(iso: string, timeZone = 'Asia/Dubai') {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(new Date(iso));
}
