# Community Events — assessment API collection

Import **community-events.json** from this folder into WireMock Cloud. The simplified collection has **three GET endpoints and 16 stubs**. Multiple stubs supply different event IDs and loading/error/empty cases; they are not additional application endpoints.

The live collection passed all 23 response/status/CORS checks. The app now uses these APIs by default, with simple validated fetch functions and visible bundled-demo fallbacks plus retry. See the project README for configuration and fallback behavior.

## The three endpoints

| Endpoint               | Response                                                    | Screen                               |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------ |
| `GET /api/events`      | Array of event summaries                                    | Discover                             |
| `GET /api/events/{id}` | Full event, embedded host profile, attendee preview objects | Event detail                         |
| `GET /api/hosts/{id}`  | Host profile with its hosted event summaries                | Host profile, including direct links |

Event IDs are `event-1` through `event-7`. Host IDs are `maya` and `alex`. All paths share one public base URL, for example `https://dgm45.wiremockapi.cloud`.

### Discover and category filtering

`GET /api/events` returns one flat array. Every event has its own `category` field: Music, Sports, Tech, Food or Other. The app fetches the catalog, then filters that array when a category is selected. All shows the whole array. No request is needed for each tab change.

For this seven-event assessment dataset, a flat array avoids duplicating events into category-specific JSON groups and keeps filtering immediate. A large paginated backend could later accept a category query parameter; this mock does not implement one.

Each event summary contains:

```json
{
  "id": "event-1",
  "title": "Sunset sessions in the park",
  "category": "Music",
  "date": "2026-10-01T14:00:00Z",
  "endDate": "2026-10-01T16:00:00Z",
  "timeZone": "Asia/Dubai",
  "location": "Creek Park, Dubai",
  "attendeeCount": 48,
  "hostId": "maya",
  "hostName": "Maya Chen",
  "imageUrl": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80"
}
```

### Event details

`GET /api/events/event-1` returns the same summary fields, plus:

- `description`: the full event description.
- `host`: `{ id, name, bio, avatarUrl }` — enough to show host information without another request.
- `attendeePreview`: an array of `{ id, name, avatarUrl }` objects — no separate attendee lookup API.

The preview contains only a few attendees; it does not represent the total count. The zero-attendee event has an empty preview. Avatar URLs are mock presentation data; the UI should fall back to initials if a photo cannot load. A missing cover uses an empty `imageUrl` and should show a placeholder.

### Host profile and hosted events

`GET /api/hosts/maya` returns `{ id, name, bio, avatarUrl, events }`. Its `events` array contains only that host's event summaries, identical to the corresponding Discover summaries.

This endpoint supports opening `/host/maya` directly, without first loading an event. There is no separate host-events API. The nested `host` in event details does not contain an `events` array, avoiding recursive/oversized responses.

## My Events and RSVP

There is **no My Events API and no RSVP mutation API** in this collection.

The assessment requires AsyncStorage persistence, not accounts or a backend membership service. The app stores the current demo user's joined IDs and event snapshots locally. My Events derives its list from that membership and separates Upcoming/Past using timestamps. Events whose end time has not passed are Upcoming; when no end is available, use the start time.

RSVP updates the displayed count and membership immediately, then saves through AsyncStorage. A storage write failure rolls back the action and exposes retry. The mock API is not responsible for storing or changing attendance.

`attendeeCount` excludes the current demo user. The displayed count is `attendeeCount + 1` when locally joined. The demo user's avatar is added locally once. This contract supports one user on one device/browser origin; cross-device synchronization is outside this assessment.

## Loading, empty and error states

These are response variants on the same three endpoints, retained for the assessment's required async states:

| Request                              | Result                                  |
| ------------------------------------ | --------------------------------------- |
| `GET /api/events`                    | JSON 200, seven summaries               |
| `GET /api/events?mock=empty`         | JSON 200, empty array                   |
| `GET /api/events?mock=error`         | JSON 503                                |
| `GET /api/events/event-1?mock=error` | JSON 503; works for all known event IDs |
| `GET /api/hosts/maya?mock=error`     | JSON 503; works for both known hosts    |
| `GET /api/events/unknown`            | JSON 404                                |
| `GET /api/hosts/unknown`             | JSON 404                                |

All responses have a 350 ms delay to expose loading UI. Error variants use priority 1, success uses 5, and unknown-ID responses use 10 within the same route template. Unknown IDs return 404 even with `mock=error`.

Errors use `{"error":{"code":"SERVICE_UNAVAILABLE","message":"..."}}` or `{"error":{"code":"NOT_FOUND","message":"..."}}`.

Completely undefined URLs may return WireMock's default plain-text 404. No `/api/not-a-route` stub or generic catch-all is needed. Removed APIs (`/api/attendees`, PUT/DELETE RSVP), the slow-response variant, and bonuses are not part of this collection.

Responses include `Access-Control-Allow-Origin: *`. The app should make ordinary GET requests without cookies, authentication or unnecessary Content-Type/custom headers. WireMock Cloud handled CORS preflight automatically during earlier testing; this collection does not add an OPTIONS API.

## Re-import and verify

1. Replace the previous collection's stubs with this file. Do not append it: obsolete attendee and RSVP stubs would remain callable. Preserve any custom mock changes you want to keep before replacement.
2. Import `community-events.json`. Expect 16 stubs for three GET route templates.
3. Send the public base URL back for live verification. No WireMock admin token is needed.

Example checks:

```sh
curl -i 'https://dgm45.wiremockapi.cloud/api/events'
curl -i 'https://dgm45.wiremockapi.cloud/api/events/event-1'
curl -i 'https://dgm45.wiremockapi.cloud/api/hosts/maya'
curl -i 'https://dgm45.wiremockapi.cloud/api/events?mock=empty'
curl -i 'https://dgm45.wiremockapi.cloud/api/events/event-1?mock=error'
curl -i 'https://dgm45.wiremockapi.cloud/api/hosts/unknown'
```

The import uses the shared `urlPathTemplate` / `pathParameters` format from [WireMock Cloud's import example](https://docs.wiremock.io/api-reference/stub-mappings/import-stub-mappings). It was chosen after live testing showed broad cross-route error stubs did not reliably select the intended responses.

## Data and integration notes

- List responses are bare arrays. Detail/profile responses are bare objects; there is no `data` wrapper.
- The adapter maps `date` to `startsAt`, `endDate` to `endsAt`, and `attendeeCount` to `baseAttendeeCount`. Embedded host/attendee objects supply profiles and avatar URLs directly.
- API summaries intentionally omit descriptions and attendee profiles. The app distinguishes summary/detail types and retains snapshots for saved events. Do not treat summaries as fully loaded details.
- Six events have fixed dates on October 1–6, 2026; one is on September 20, 2026. If renewing the demo later, update matching dates in the list, detail and host responses together. The app should display API dates without rewriting them.
- Mock host bios, descriptions and portraits are demo data. Photo failures must not block browsing.
