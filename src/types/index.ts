import { strings } from '@/constants/strings';
export const categories = ['Music', 'Sports', 'Tech', 'Food', 'Other'] as const;
export type Category = (typeof categories)[number];
// The list and RSVP snapshots contain summaries; details are loaded independently.
export type CommunityEvent = Readonly<{
  id: string;
  title: string;
  category: Category;
  startsAt: string;
  endsAt?: string;
  timeZone?: string;
  location: string;
  hostId: string;
  hostName?: string;
  imageUrl?: string;
  baseAttendeeCount: number;
  // Optional legacy snapshot fields, retained for existing v1 AsyncStorage data.
  description?: string;
  attendeePreviewIds?: readonly string[];
}>;
export type Person = Readonly<{ id: string; name: string; avatarUrl?: string }>;
export type Host = Person & Readonly<{ bio: string }>;
export type EventDetail = CommunityEvent &
  Readonly<{
    description: string;
    host: Host;
    attendeePreview: readonly Person[];
  }>;
export type HostProfile = Host & Readonly<{ events: CommunityEvent[] }>;
export const currentUser: Person = { id: 'me', name: strings.common.you };
export type FetchResult<T> = {
  data: T;
  usingFallback: boolean;
};
