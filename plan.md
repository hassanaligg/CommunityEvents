# Community Events App — assessment implementation plan

Prepared: 20 September 2026. Source: the two-page `Interview_Task_Social_CommunityEventsApp (1).pdf` supplied with this request.

Implementation started on 21 September 2026. Core browsing and RSVP features are implemented in the project root. Checked items below have implementation evidence; unchecked items remain pending, including all bonuses and native-device verification.

### Implementation status — first core pass

- Foundation: SDK-compatible AsyncStorage, Jest/RNTL, ESLint, Prettier, strict TypeScript, validated fixtures, simple fetch functions and injected clock are implemented.
- Browsing: Discover, category filtering, responsive EventCard grid, direct event detail, host profile, not-found UI, light/dark palette, image fallback, and loading/error/empty UI are implemented.
- RSVP: shared Context/useReducer, synchronous per-event guard, optimistic counts/membership, ordered durable writes, scoped rollback/retry, hydration, saved snapshots, and Upcoming/Past My Events are implemented.
- Evidence: 17 Jest tests; Chrome end-to-end test for four screens, category filtering, widths 767/768/769, direct/missing event URLs, RSVP reload restoration and cancellation persistence; four screenshots in `docs/screenshots/`.
- Still pending: exact time-boundary scheduling (currently one-second focused refresh), grid focus/scroll preservation across column changes, explicit corrupt-data reset UI, native smoke/accessibility/deep-link checks, 1,000-event performance profiling, all Phase 4 bonuses, and final submission packaging. No claim is made that all R01–R14 platform gates are complete.

### API integration — 23 September 2026

The approved WireMock collection has three read endpoints: event list, event detail with host/attendee objects, and host profile with hosted events. All 23 live contract checks passed. The app now uses three fetch functions by default; category filtering, RSVP and My Events membership remain local.

The API layer was simplified at the user's request: `fetchEvents`, `fetchEventDetails`, and `fetchHostProfile` perform HTTP checks, runtime validation and bundled sample fallback. A `usingFallback` flag drives a visible notice/retry. API caching, cache-write coordination, the repository factory and API provider have been removed. AsyncStorage remains only for RSVP membership/snapshots. Successful empty responses and resource 404s are respected; screen unmounts cancel requests. Summaries and details remain distinct, and API dates are not shifted.

## 1. Project decision and scope

**Use this project root (`EventApp/`).** The plan originally referred to a nested `community-events-app/` project, but the actual workspace is now the Expo starter itself. Run all commands from the directory containing this `package.json`. Expo 57, Router 57, React Native 0.86.3, and React 19.2.3 remain aligned; the parent's earlier CLI project is not present here.

**Separate the brief from implementation choices.** Requirements labeled **Required** or **Bonus** below come from the PDF. Validation limits, data enrichment, error recovery policies, architecture, and additional tests are proposed engineering decisions. The PDF describes an offline take-home assignment with no time constraint; this does not itself require a fully offline application or a live backend. Its submission instructions are planned deliverables, not a request to publish or contact anyone now.

### Required stack

| Concern | Assessment requirement | Implementation decision |
| --- | --- | --- |
| Runtime | React Native / Expo, TypeScript | Expo SDK-compatible packages; strict TypeScript throughout app code |
| Navigation | Expo Router | Thin file-based routes, typed parameters, shared root providers |
| State | Context API + `useReducer` | Pure reducers, separate state/action contexts, domain hooks |
| Persistence | AsyncStorage | Validated, versioned JSON with ordered writes and explicit hydration |
| Images | `expo-image` | Fixed aspect ratios, caching, placeholders, failure fallback |
| Tests | Jest + `@testing-library/react-native` | `jest-expo` preset, behavioral component tests and store tests |
| Platforms | iOS, Android, Web | Shared screens; platform adapters only for platform-specific capabilities |

Use React state for temporary input and filters. Do not replace the required state stack with Redux, Zustand, or a query library. A schema library such as Zod can be added for shared runtime validation; a form library is optional and should earn its dependency cost.

## 2. Requirement and acceptance matrix

| ID | Priority | Requirement from PDF | Completion evidence |
| --- | --- | --- | --- |
| R01 | Required | Fetch/display event cover, title, date/time, location, attendee count | Discover loads through a validated fetch function; every card has the required fields |
| R02 | Required | Music, Sports, Tech, Food, Other category tabs | Every tab filters correctly; selected state is accessible; an additional All tab resets filtering |
| R03 | Required | Optimistic RSVP toggle without reload | Count, icon, and membership update immediately; failed persistence rolls back safely |
| R04 | Required | Event detail with description, host info, attendee avatars | Detail works from a card and from a direct URL; host opens its profile |
| R05 | Required | My Events: upcoming/past RSVPs with persistence | Add/remove updates all relevant screens; a fresh launch restores membership |
| R06 | Required | Loading, empty, error states for every async operation | Feed, detail, host, hydration, RSVP, and implemented bonuses have appropriate recovery UI |
| R07 | Required | One column below 768 px; two at/above 768 px | Resize/orientation checks at 767, 768, and 769 logical pixels on supported platforms |
| R08 | Required | Navigate on tap/click and support deep links | `/event/{id}` and `eventsapp://event/{id}` open the correct event from cold and warm starts |
| R09 | Required | Discover, Event detail, My Events, Host profile | All four screens are complete and represented in screenshots/recording |
| R10 | Required | EventCard component test | RSVP interaction verifies displayed count and selected/unselected icon state |
| R11 | Required | RSVP store/action test | Add, persist, restore in a fresh store, remove, persist, and restore again |
| R12 | Required | Full source via public GitHub repository or ZIP | Self-contained source, lockfile, assets, configuration, and tests are ready to submit |
| R13 | Required | README run instructions and technical decisions | iOS/Android/Web commands; state, component architecture, and persistence explained |
| R14 | Required | Cross-platform, TypeScript, at least two passing tests | Recorded checks plus platform smoke tests; starter render test alone does not qualify |
| B01 | Bonus | Create-event form with `expo-image-picker` | Valid event and durable cover image survive restart and appear in the feed |
| B02 | Bonus | Attendee chat using mock WebSocket or polling | Event-specific messages, send/retry states, and subscription cleanup |
| B03 | Bonus | Calendar export in iCal format | Valid `.ics` file downloads/shares and imports into a calendar |
| B04 | Bonus | Geofence-based nearby-events filter | Foreground radius filter on all platforms; native region monitoring with documented web fallback |

The evaluation table calls error handling a nice-to-have, but the core list explicitly requires loading, empty, and error states. Treat those states as mandatory.

## 3. Resolve data gaps deliberately

The PDF offers `GET https://mocki.io/v1/demo-events-api` or a starter `sample.json`. No `sample.json` was found in this workspace. The endpoint could not be verified during planning; do not depend on its availability for the interview demonstration. The PDF provides a sample shape, not a complete data contract or mutation API.

### Chosen data approach

- [x] Bundle approved API detail fixtures in `src/data/events.json`; derive fallback summaries and host profiles from this catalog.
- [x] Add clearly identified mock enrichment for descriptions, stable host IDs, host bios/avatars, attendee previews, optional end times, event time zones, and coordinates. Do not imply these came from the employer's API.
- [x] Use three validated fetch functions with visible sample fallbacks; mock fetch in tests.
- [x] Keep API calls in one small module and expose fallback status to screens; no repository factory or API provider is needed.
- [x] Include every category, several hosts, zero/large attendee counts, long text, missing images, and both past/upcoming dates. Remote image failures must still leave usable local placeholders.
- [x] Use deterministic IDs and fixed API dates; never shift them on launch. Tests use a fixed clock. Existing storage retains its legacy seed field only for compatibility.

The example date in the PDF is in 2025 and is already in the past. Copying it as the only event would leave the upcoming view empty. An avatar preview may contain fewer people than `attendeeCount`; describe it as a preview and never derive the total from its length.

### Types and API boundary

Keep DTOs separate from internal models. A useful normalized event model includes:

```ts
type EventCategory = 'Music' | 'Sports' | 'Tech' | 'Food' | 'Other';

type CommunityEvent = Readonly<{
  id: string;
  title: string;
  category: EventCategory;
  startsAt: string; // Valid ISO timestamp containing UTC or an explicit offset.
  endsAt?: string;
  timeZone?: string; // Valid IANA zone when supplied.
  location: string;
  coordinates?: Readonly<{ latitude: number; longitude: number }>;
  description: string;
  hostId: string;
  imageUrl?: string;
  baseAttendeeCount: number; // Fixture contract: excludes the demo user.
  attendeePreviewIds: readonly string[];
}>;
```

Use a fixed mock current user; authentication is not specified. Keep hosts and attendee profiles in ID-indexed collections. A missing host is a recoverable unavailable-profile state, not a crash. Record fixture enrichment and mock identity in the README.

The API module exports `fetchEvents(signal)`, `fetchEventDetails(id, signal)`, and `fetchHostProfile(id, signal)`. Each returns validated data and a `usingFallback` flag. Fetch functions handle HTTP failures, cancellation, unknown IDs and sample fallback. No API-response caching or additional catalog provider is planned for the assessment.

## 4. Project structure

Simplified after reviewing `my-shop-lite`. The implemented structure is:

```text
src/
  app/          # Expo Router routes and layouts
  screens/      # Discover, EventDetail, MyEvents, HostProfile
  components/   # Cards, grid, RSVP button and shared UI
  services/     # Three API fetch functions with sample fallback
  store/        # RSVP Context and reducer
  hooks/        # Request lifecycle and screen clock
  types/        # Shared TypeScript types
  utils/        # Validation, dates and RSVP storage
  data/         # Bundled fallback events
  test/         # API and RSVP tests
```

Keep Expo Router and Context + `useReducer`, as required by the assessment. Use thin route files and one file per screen. Keep request cancellation, runtime validation, responsive sizing and storage failure recovery. No API caching, repository factory, additional data provider or bonus folders are needed.

## 5. State, optimistic RSVP, and persistence

This is the most important part to implement carefully and explain clearly.

### Ownership and invariants

- [ ] Normalize catalog data into `eventsById`, `eventIds`, and hosts. Keep stable event object references when an RSVP changes.
- [x] Keep RSVP membership and per-event pending/error metadata in their own reducer. The same state drives Discover, Detail, Host event cards, and My Events.
- [x] Derive `displayedCount = baseAttendeeCount + (effectiveRsvp ? 1 : 0)` under the documented local-fixture contract. Never persist another incremented count alongside it.
- [ ] For a future server contract that already includes the current user, calculate the optimistic delta against server-confirmed membership; do not reuse the local formula blindly.
- [x] Derive My Events from membership and event data; never maintain a separately edited My Events array.
- [ ] Use discriminated actions such as `HYDRATE_SUCCESS`, `RSVP_REQUEST`, `RSVP_COMMIT`, and `RSVP_ROLLBACK`. Pending mutations carry a unique request ID and desired membership.
- [x] Use separate state and action contexts. Keep filters, draft text, focus, and form errors local. Chat updates must not update the feed's provider.

### Optimistic transaction sequence

1. Confirm hydration succeeded, the event is available, and there is no pending operation for that event. Use a synchronous guard at the action boundary as well as a disabled button, so two presses before the next render cannot double-submit.
2. Dispatch the desired membership immediately. All screens show the new count/icon and My Events membership without waiting for AsyncStorage. Show a pending indicator and prevent another RSVP mutation for that event.
3. Enqueue a persistence command. Because the PDF provides no RSVP write endpoint, successful local persistence is the acknowledgement for this implementation; do not invent a real server response.
4. The write coordinator processes commands in order. For each command, build the next durable envelope from the **last successfully written envelope**, applying only that command's change. Include enough event data to restore an RSVP even if the remote catalog is unavailable later.
5. On successful write, advance the durable envelope and dispatch commit for the matching request ID. On failure, retain the previous durable envelope and roll back only that event's matching optimistic change; show a retryable message.
6. A failure for event A must not undo event B. A rejected write must not poison the queue; subsequent commands still execute. Ignore obsolete responses after reset/disposal.

This ordered coordinator also serializes event creation and other updates to the same envelope. A generic effect that saves every transient reducer snapshot can accidentally persist other pending transactions or overwrite a newer write with an older one. Keep persistence at the command boundary instead.

### Storage contract and startup

Use an app-specific key such as `community-events:state:v1` containing a schema version, confirmed RSVP membership, saved event snapshots, locally created events, and the demo seed anchor. Do not persist loading flags, request IDs, raw errors, or in-flight operations.

- [x] Hydration states: `loading`, `ready`, `error`. Mount Router normally, but show suitable loading UI and block RSVP mutations until hydration completes. Do not write an empty initial state over saved data.
- [ ] Validate parsed storage and migrate known older versions. For corrupt/unknown versions, preserve the raw value, offer retry or an explicit app-data reset, and explain any recovery. Do not silently claim successful restoration.
- [x] AsyncStorage read/write errors and browser quota failures get actionable UI. If temporary in-memory continuation is offered, clearly say changes will not survive restart.
- [x] Persist IDs plus sufficient event snapshots for My Events. If a record disappears from the source, retain the user's saved entry as unavailable and allow removal; keep confirmed deleted events distinguishable from a temporary fetch failure.
- [ ] Merge fresh catalog data without overwriting local membership or locally created events. Do not deduce membership from attendee count.
- [x] Successful RSVP persistence must survive a fresh provider mount and process restart. A process killed before a write is acknowledged may lose that pending action; avoid representing it as saved.
- [ ] Keep chat history separate and bounded. Store image metadata/URIs in AsyncStorage, not image binary/base64.
- [x] Document this as one demo user on one device/browser origin. Multi-device synchronization and concurrent editing in multiple browser tabs require a stronger synchronization contract and are outside this brief.

## 6. Screens, routes, and responsive behavior

### Discover

- [x] Header, horizontal category tabs, and virtualized event grid. Default All is an additional usability choice.
- [x] Sort upcoming events by start time; keep any past section/order explicit and stable, with ID as a tie-breaker. Filters combine category and nearby criteria when B04 is enabled.
- [x] Use `useWindowDimensions()` and a shared `768` breakpoint. Native dimensions are logical layout units; web uses CSS pixels. Exactly one column below the threshold and exactly two at/above it, including large desktop widths.
- [ ] Use `FlatList` with stable ID keys. Changing `numColumns` requires recreating the list with a column-specific key; account for scroll position and focused items when resizing. Keep filters outside that remounted subtree.
- [ ] Maintain gutters, safe areas, and a centered maximum-width content container. Handle an odd final item without stretching it to full width.
- [x] Make the card's navigation area and RSVP button separate accessible targets so RSVP does not navigate. Support keyboard activation on web.
- [x] Distinguish first-load loading, refresh with existing content, no events, no filter matches, initial failure, and refresh failure with stale data plus retry.

### Event detail

- [x] Load by route ID independently of the feed. Validate absent, repeated/array, malformed, and unknown IDs.
- [x] Cover, full description, category, date/time with time-zone clarity, location, host link, RSVP action, and attendee preview with overflow count.
- [x] Add the demo user's avatar exactly once when joined, including immediate optimistic removal on cancel. Missing avatars use initials or a placeholder.
- [ ] Optional calendar/chat actions appear when implemented. Chat eligibility updates if the user cancels their RSVP.
- [ ] On direct launch without navigation history, offer a reliable Discover fallback. Keep not-found separate from loading and transport failure.

### My Events

- [ ] Upcoming and Past tabs/segments derive from saved membership; both have dedicated empty states.
- [ ] Proposed date policy: use `endsAt` when known, otherwise `startsAt`, as the cutoff. An event is past when `cutoff <= now`; an ongoing event remains in Upcoming and is labeled in progress.
- [ ] Upcoming sorts ascending; Past sorts descending. Freeze the clock in tests, recompute on focus/app resume, and schedule a bounded next-boundary update while the screen remains open.
- [ ] Allow removing old saved RSVPs; disable joining an already ended event. This is a product choice, not an explicit rule in the PDF.
- [ ] Render from saved snapshots if catalog refresh fails; show an unobtrusive saved-data indicator where useful.

### Host profile

- [ ] Avatar, name, bio, and hosted events linked to detail. A zero-event host and a missing host both have deliberate states.
- [ ] The PDF requires this screen but does not provide profile fields; use labeled fixture enrichment, with stable host IDs rather than display-name matching.

### Deep-link and web configuration

- [ ] Use the exact custom scheme `eventsapp` in Expo configuration and route `src/app/event/[id].tsx` for `/event/{id}`.
- [ ] Preserve typed routes, pass IDs rather than serialized event objects, and use Router links for clickable browser navigation.
- [ ] Select web output `single` for this local-first assessment, including events created after build time. Document the tradeoff: no pre-rendered SEO pages, but arbitrary IDs resolve client-side. Production hosting must serve `index.html` for app routes while serving real assets normally. See [Expo web output/deployment](https://docs.expo.dev/guides/publishing-websites/).
- [ ] Test browser direct entry and refresh for a valid ID, unknown ID, and a locally created ID. Unknown IDs must reach the app's not-found UI rather than a host-level 404.
- [ ] Validate `eventsapp://event/evt-001` in an installed development build on both native platforms. Expo Go uses its own `exp://.../--/event/evt-001` URL and cannot prove custom-scheme registration. See [Expo deep linking](https://docs.expo.dev/linking/into-your-app/).

## 7. Validation, errors, and accessibility

### Data and behavior checks

| Boundary or edge case | Planned behavior |
| --- | --- |
| Invalid JSON, non-array response, duplicate event IDs | Reject an invalid catalog with a clear data error; keep prior valid data during refresh |
| Missing identity/title, invalid timestamp, negative/fractional count | Reject structurally invalid records; test the mapper separately |
| Unknown category | Normalize to Other with a development diagnostic |
| Missing description, host enrichment, image, avatar | Honest fallback content; critical navigation remains usable |
| Invalid optional coordinates/end time | Exclude invalid optional capability; never calculate distance/export from invalid values |
| API response arrives after unmount or newer request | Abort when supported and ignore obsolete request IDs |
| Rapid refreshes/filter changes | Do not let an older result replace the latest request's result |
| Rapid RSVP presses or the same event on two screens | Shared per-event guard prevents duplicate mutations |
| Write failure while another event changes | Roll back only the failed event; preserve other pending/saved changes |
| App restarts during loading | Hydrate first, then reconcile catalog; no saved-state wipe |
| UTC date near midnight or daylight-saving transition | Compare timestamps, not formatted labels; display using an explicit valid time zone |
| Unicode, emoji, long/unbroken strings | Wrap safely, bound input length, retain full detail text |
| Network/image failure | Fallback visual or retry state; avoid infinite automatic retry loops |
| Permission denied, permanently denied, or revoked | Explain the affected optional feature, allow retry/settings where applicable, retain basic browsing |

Validate at external boundaries: repository responses, storage, route parameters, form submission, and native API responses. TypeScript alone does not validate runtime JSON. Avoid unchecked casts, non-null assertions, `any`, and blanket lint suppression. Use narrow typed errors, immutable updates, exhaustive reducer handling, and `unknown` in catch/parse boundaries.

### Form validation decisions for B01

These are proposed limits, not requirements stated by the employer:

| Field | Rule |
| --- | --- |
| Title | Trim; 3–100 characters; reject whitespace-only input |
| Description | Trim; 20–5,000 characters; plain text |
| Category | Exactly one of the five required categories |
| Start | Valid future instant at submit time; show input time zone |
| End | Required in the create form; strictly after start |
| Location | Trim; 3–200 characters; do not infer coordinates from an unverified string |
| Coordinates | Optional pair; finite latitude -90…90, longitude -180…180 |
| Cover | One supported image, maximum 5 MB after processing; cancellation is not an error |
| Host / ID / attendee count | Set from mock identity and generated ID; users cannot edit these internal fields |

Share validation between submission and repository commands. Show inline errors on blur/submit, focus the first invalid field, keep entered values on failure, and revalidate future dates immediately before saving. If byte size or MIME is missing from the picker, inspect/process the asset before accepting it. Convert supported camera formats to a compatible image when needed; otherwise explain the unsupported format.

### Accessibility and UI quality

- [ ] Accessible labels, roles, selected/busy/disabled states, and text alternatives for meaningful images. Do not make status depend only on color or an icon.
- [ ] Comfortable touch targets (aim for at least 44–48 logical pixels), visible keyboard focus, logical tab order, and VoiceOver/TalkBack announcements for relevant errors.
- [ ] Support large font sizes, text wrapping, reduced motion, safe areas, device rotation, and keyboard avoidance. No forced font-scaling disablement or fixed text heights.
- [ ] Centralize light/dark theme tokens with readable contrast. Use consistent spacing and reusable UI primitives without introducing a large design-system dependency.
- [ ] Add a route/root error boundary for unexpected render failures; recoverable API/storage errors stay in feature state. Avoid showing raw stack traces or internal implementation details to users.

## 8. Bonus implementation plans

Implement every bonus after the required feature/test gate passes. Suggested order: Create Event → Calendar Export → Chat → Nearby/Geofencing. Each bonus needs its own working failure cases and platform notes.

### B01. Create event with image picker

- [ ] Route `/create-event` with accessible fields, category selector, start/end date controls, image preview/change/remove, and submit feedback.
- [ ] Install `expo-image-picker` with `npx expo install`; invoke the picker from the user's press, particularly on web. Handle cancel, no assets, denied access, and platform-specific permission behavior. See [ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/).
- [ ] Introduce a small image attachment service: copy accepted images into durable app storage on native; persist browser-selected blobs in IndexedDB on web. Keep only attachment references in the event JSON. A temporary picker URI or browser object URL alone does not survive restart.
- [ ] Normalize size/dimensions to an appropriate display resolution. Release temporary/object URLs and clean orphan attachments after failed creation or replacement; define safe cleanup for a crash between file and metadata writes.
- [ ] Use native date inputs with a web-specific input adapter when necessary. Explicitly show the selected device time zone; do not parse ambiguous date strings.
- [ ] Generate a stable unique event ID, assign the mock host, and use the shared ordered persistence coordinator. Prevent repeated submission. Add the event to the catalog only after a successful durable save, then navigate to detail.
- [ ] Proposed product choice: creating an event does not automatically RSVP; My Events remains a list of joined events. Host profile shows created events.
- [ ] Verify valid create, invalid fields, picker cancellation, unsupported/oversized images, write failure/retry, duplicate presses, restart with image, and the new event's direct URL in the same browser origin.

### B02. Attendee chat

- [ ] Route `/event/{id}/chat`; only an effective attendee can access sending controls. This is demo UI gating, not backend authorization.
- [ ] Choose mock polling for the first implementation. Define a replaceable transport with `listMessages(eventId, cursor)` and `sendMessage(eventId, clientMessageId, text)`.
- [ ] Poll approximately every five seconds only while the chat screen and app are active. Allow at most one poll in flight, clean up timers, and use bounded retry/backoff after failures. Refresh immediately on resume.
- [ ] Model messages with stable server/mock ID, client ID, event ID, sender, timestamp, text, and pending/sent/failed state. Deduplicate poll results and optimistic send echoes by ID; order equal timestamps with a stable tie-breaker.
- [ ] Trim input, reject blank messages, cap at 1,000 characters, and retry failed messages with the same client ID. Preserve the draft when sending fails.
- [ ] Use a virtualized message list with bounded retained history. Auto-scroll only when already near the bottom or after the user's own send; otherwise show a new-message affordance.
- [ ] Persist a bounded confirmed history separately if implemented; mark it as local mock conversation, not a real multi-user service. Use seeded replies to demonstrate receiving messages.
- [ ] Test duplicate delivery, send failure/retry, event switching, RSVP cancellation, out-of-order messages, background/resume, and unmount cleanup using fake timers.

### B03. Calendar export

- [ ] Build a pure serializer for one `VCALENDAR` containing a `VEVENT`: `VERSION`, `PRODID`, stable `UID`, `DTSTAMP`, UTC `DTSTART`, optional valid `DTEND`, `SUMMARY`, `DESCRIPTION`, and `LOCATION`.
- [ ] Escape text backslashes, commas, semicolons, and newlines; use CRLF and fold long content lines at 75 octets without breaking UTF-8 characters. Prevent user text from injecting additional calendar properties. See [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545).
- [ ] If the source has no end time, omit it rather than inventing a duration. Repeated export uses the same event UID; explain that final duplicate handling depends on the calendar importer.
- [ ] Native: write a temporary `.ics` file and use an available share handler via `expo-file-system` / `expo-sharing`. Web: download a Blob with `text/calendar` and revoke its object URL. Web download avoids depending on local-URI sharing, which differs by platform; see [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/).
- [ ] Treat user dismissal as cancellation, not success or failure. Explain a missing compatible native handler; do not request calendar database permission merely to export a file.
- [ ] Test UTC conversion, missing end time, Unicode line folding, escaping, and invalid dates; manually import an exported file in a calendar client.

### B04. Nearby filter and native geofencing

The brief does not define whether geofencing means foreground radius filtering or background region entry/exit. Plan both layers so the bonus is fully addressed, and document the platform distinction.

- [ ] Add valid coordinates to fixtures. A nearby switch requests foreground location on demand; offer 1/5/10/25 km radii. Compute distance with a tested Haversine helper and filter with `distance <= radius`.
- [ ] Web uses browser foreground geolocation on HTTPS/localhost; denied/unavailable location offers retry or an explicitly selected demo/manual area. Never silently substitute a fake user location. Events without coordinates remain in the normal feed but cannot match nearby filtering.
- [ ] Handle disabled location services, timeout, low accuracy, stale results, revoked permissions, and no nearby matches. Discard a late location result after timeout/cancellation. Combine radius and category filters predictably.
- [ ] Foreground updates should use a conservative update interval/distance and stop when no longer needed. Avoid continuous high-accuracy tracking for a simple discovery filter.
- [ ] Native extension: define an `expo-task-manager` task at module scope and register event-centered regions through `expo-location`. Derive region membership from entry/exit callbacks, reconcile on resume, and stop monitoring when the feature is disabled or no longer authorized.
- [ ] Use a development build for native background behavior; request foreground permission before explaining/requesting background access. Configure the native permission descriptions and platform capabilities. OS-monitored geofencing is not the browser fallback. Expo documents native permission/setup requirements and limits of 20 monitored regions on iOS and 100 on Android; choose a stable nearest subset within those limits. See [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/).
- [ ] Verify region entry/exit with simulated device movement and at least one native device if available. Do not claim guaranteed delivery after force-stop or continuous background execution. Record exactly what was exercised.
- [ ] Test exact-radius inclusion, zero distance, invalid coordinates, longitude wraparound, permission denial, web fallback, listener cleanup, and registration reconciliation.

## 9. Performance plan

- [x] Start with `FlatList`, measured image sizes, and stable IDs. Avoid a list inside a same-direction `ScrollView`; use list header/footer/empty components instead.
- [x] Keep full-resolution images out of cards; use appropriately sized sources, fixed aspect ratios, placeholders, and `expo-image` caching. Bound prefetching and avatar previews.
- [ ] Pass narrow props to EventCard and keep event objects unchanged for RSVP-only updates. A list container may consume RSVP context and pass membership/count to memoized cards. `React.memo` does not prevent updates when a component directly consumes a changed context.
- [ ] Split high-frequency chat/form state from event/RSVP state. Keep action context identities stable; do not add memoization everywhere without checking its effect. Preserve the starter's React Compiler setting unless compatibility testing identifies a reason to change it.
- [ ] Derive filtered/sorted collections once per relevant data/filter/clock change. Never parse all dates, sort the full catalog, or calculate every distance independently inside each rendered card.
- [ ] Only use `getItemLayout` when dimensions are truly predictable; dynamic type and wrapping can invalidate guessed heights. Tune virtualization settings after measuring blank cells, responsiveness, and memory. See [React Native FlatList guidance](https://reactnative.dev/docs/optimizing-flatlist-configuration).
- [ ] Remove inactive polling/location subscriptions, clear timeouts, cancel obsolete requests, and release object URLs. Bound cached messages and temporary files.
- [ ] Profile a release/preview build using a deterministic stress fixture of approximately 1,000 events. Exercise scrolling, filtering, RSVP, route transitions, image loading, and repeated chat entry/exit.
- [ ] Capture baseline and final observations on the same device/build. Target immediate RSVP feedback, smooth scrolling at the device refresh rate, and no continuously growing memory across repeated navigation. Record measurements and limitations rather than claiming unmeasured FPS/startup guarantees.

## 10. Testing and required checks

Add Jest using the SDK-compatible `jest-expo` preset and `@testing-library/react-native`. Test screen behavior through real reducers/providers with mocked service/storage/native boundaries. Keep tests outside `src/app`. Follow [Expo's Jest setup](https://docs.expo.dev/develop/unit-testing/); do not carry over the parent's template-only renderer test.

### Two explicitly required tests

1. **EventCard component:** render a known event with count 10 and a real test provider; press RSVP; while the controlled write promise is still pending, assert count 11 and selected icon/accessibility state. Resolve the write, press again, assert count 10 and unselected state. Verify RSVP did not navigate.
2. **RSVP store/action and persistence:** add an RSVP, assert My Events selectors update, await storage write, dispose the provider/store, create a fresh instance using the stored payload, and assert restoration. Remove it, persist, hydrate another fresh instance, and assert absence. Checking only that `setItem` was called does not prove persistence.

### Additional focused regression coverage

| Layer | Highest-value cases |
| --- | --- |
| Reducer/actions | Duplicate press guard, immutable transitions, rollback, two-event isolation, stale acknowledgements |
| Storage | Empty/corrupt/old schema, read failure, ordered writes, failure followed by a successful write, hydration race |
| Selectors/dates | Category combinations, Upcoming/Past exact boundary, ongoing event, time-zone-independent comparisons |
| API/validation | Valid fixtures, invalid JSON/shape, duplicate IDs, cancellation, HTTP failure if remote mode is included |
| Screens/router | Direct detail before feed load, unknown ID, host profile, error retry, distinct empty states |
| Responsive/accessibility | 767/768/769 widths, odd grid count, button semantics, large fonts, web keyboard paths |
| Create bonus | Validation, duplicate submit, image cancellation, durable image restoration, save rollback |
| Chat bonus | Timer cleanup, deduplication, order, retry with the same ID, no cross-event leakage |
| Calendar bonus | Parseable output, escaping, byte-aware folding, UTC and optional end time |
| Nearby bonus | Distance boundaries, invalid inputs, denied/unavailable permission, region reconciliation |

Prefer behavior assertions over broad snapshots and avoid tests that merely repeat implementation constants. Inject time and service failures; use controlled promises instead of arbitrary sleeps. Reset providers and fake timers between tests. Mock boundaries, not the business logic being tested.

### Tooling to add during implementation

- [x] SDK-compatible AsyncStorage and Jest/RNTL dependencies installed from this directory; one npm lockfile for this project.
- [x] ESLint/Expo config, formatting configuration, strict TypeScript, and `noUncheckedIndexedAccess` after fixing resulting findings. Evaluate `exactOptionalPropertyTypes` while keeping third-party types compatible.
- [x] Scripts: `typecheck`, `lint`, `format:check`, `test`, `test:ci`, `check`, and `export:web`. `check` should run typecheck, lint, formatting, and tests; avoid publishing/deployment side effects.
- [ ] Optional CI runs `npm ci`, `npm run check`, and `npm run export:web` from the Expo directory. Account for the current parent-folder layout until submission is packaged as a standalone project.
- [x] Validate dependency alignment with `npx expo install --check` and project configuration with `npx expo-doctor`. Inspect warnings instead of suppressing them blindly.
- [x] Review dependency audit findings and fix relevant issues compatibly. Do not use forced dependency upgrades that bypass Expo compatibility.

Planned verification commands after the corresponding scripts/tooling are added:

```sh
cd EventApp
npm ci
npm run check
npx expo install --check
npx expo-doctor
npm run export:web
```

### Manual platform matrix

| Check | iOS | Android | Web |
| --- | --- | --- | --- |
| Four required screens, filtering, navigation | Phone + tablet layout | Phone + tablet layout | Narrow and wide browser |
| RSVP consistency and persistence | Force-close/relaunch after save | Force-close/relaunch after save | Refresh/new tab after save |
| Responsive threshold | Rotation/resizing where supported | Rotation/resizing where supported | 767, 768, 769 px |
| Deep link, cold/warm start, unknown ID | Installed custom scheme | Installed custom scheme | Direct URL + refresh on exported app |
| Loading/error/empty recovery | Controlled failure cases | Controlled failure cases | Failure cases plus storage unavailable |
| Image picker and calendar export | Cancel/permissions/import | Cancel/permissions/import | File choice/blob download/import |
| Nearby/chat lifecycle | Denial, background/resume | Denial, background/resume | Secure-context geolocation, focus changes |
| Accessibility | VoiceOver, large text | TalkBack, large text | Keyboard, focus, zoom |

Native deep-link and geofence checks require a development build; `npm run ios` / `npm run android` start Expo tooling and do not by themselves establish that these capabilities were verified. A web export is a bundling check, not proof of iOS/Android runtime behavior. Record unavailable hardware/toolchain checks honestly.

## 11. Implementation sequence and completion gates

No deadline is specified in the brief. Use these dependency-based milestones instead of invented delivery dates. Make small, reviewable commits as work is completed.

### Phase 0 — assessment and starter

- [x] Read both PDF pages and map all required features, bonuses, tests, and deliverables.
- [x] Inspect the existing native starter and choose a separate Expo project.
- [x] Generate the Expo Router/TypeScript starter and create this plan.
- [x] Install starter dependencies; pass `npm run typecheck` and the Web export. Add a tracked Expo ambient-type reference so typecheck works before the first dev-server launch. Native runtime checks and assessment tests have not been run.
- [x] Configure app display name, rotation/tablet support, exact `eventsapp` link scheme, and single-page web output.
- [x] Replace tutorial routes/components with assessment screens and remove the starter reset script. Unused template image cleanup remains pending.

**Gate:** the starter runs from its own directory; the developer understands the requirement matrix and data assumptions.

### Phase 1 — foundation and data

- [x] Add required persistence/testing tooling and quality scripts.
- [x] Build schema/types, fixture data/enrichment, API functions, date helpers, and clock injection.
- [x] Define theme tokens, reusable state UI, root providers, and route skeletons for all required screens.

**Gate:** validated events load asynchronously; loading/error states are reproducible; tooling catches type/lint errors.

### Phase 2 — browsing and navigation

- [x] Implement Discover, category tabs, EventCard, responsive grid, Event detail, Host profile, and not-found UI.
- [ ] Verify deep-link route resolution without visiting Discover and browser resize behavior.

**Gate:** all browsing content and routes work across native/web layouts; no RSVP business logic is duplicated in screens.

### Phase 3 — RSVP and My Events

- [x] Implement reducer, shared actions, optimistic state, ordered persistence, hydration, rollback, and upcoming/past selectors.
- [x] Implement My Events and make all screens use the same membership/count contract.
- [x] Complete both required tests and regression tests for hydration, race conditions, and failed writes.

**Gate:** all required features pass, at least the two specified tests pass, and saved RSVPs survive actual restarts.

### Phase 4 — all bonuses

- [ ] B01 Create Event and durable image attachments.
- [ ] B03 Calendar export and import verification.
- [ ] B02 Mock attendee chat and lifecycle tests.
- [ ] B04 Foreground nearby filtering plus native geofencing and documented web fallback.

**Gate:** each bonus includes validation, errors, tests, and demonstrated behavior; partial bonus support is labeled precisely.

### Phase 5 — quality, documentation, interview rehearsal

- [ ] Complete accessibility, platform, performance, and recovery checks; fix confirmed issues.
- [x] Replace generic setup text with final run instructions, architectural decisions, demo data limitations, and evidence.
- [ ] Capture all required screens and a short demonstration of RSVP persistence/deep links/bonuses.
- [ ] Package the Expo project as the submission root or clearly document its path in the parent repository. Exclude dependencies, caches, generated build outputs, secrets, and unrelated parent starter files.
- [ ] Rehearse the explanation and demo below from a clean checkout/install.

**Gate:** a reviewer can install, run, test, inspect, and understand the complete assessment without this conversation.

## 12. Interview preparation

Maintain a short technical-decisions section in the final README as implementation progresses. Explain the code you actually wrote and the evidence you collected.

| Likely question | Explanation to prepare |
| --- | --- |
| Why Expo instead of the existing CLI app? | Required Router/image stack, web support, SDK compatibility, and minimal existing code to preserve |
| Why Context + useReducer? | Required by the brief; enough complexity for pure transitions and centralized invariants; discuss its rerender limits honestly |
| Where should state live? | Catalog and membership are shared; temporary filters/forms are local; My Events/counts are derived |
| How does optimistic RSVP work? | Immediate desired state, per-event guard, ordered durable acknowledgement, scoped rollback, retry |
| What prevents incorrect attendee counts? | Explicit baseline contract, derived delta, single membership source, no repeated persisted increments |
| How does persistence survive restart? | Versioned validated envelope, hydration gate, snapshots, ordered writes, fresh-instance tests |
| What if two actions happen quickly or one save fails? | Synchronous guard, unique request IDs, latest confirmed envelope, isolated rollback, queue recovery |
| Why not put side effects in the reducer? | Purity makes transitions deterministic and testable; command/service boundaries own effects |
| How do deep links work before data loads? | ID-based routes, root hydration, independent detail lookup, loading/not-found distinction, native scheme build |
| How did you handle web deployment? | Chosen SPA output and route fallback; tradeoff versus pre-rendered pages; local-created-event limitations |
| How are past/upcoming and time zones handled? | Stored instants, explicit cutoff policy, injected clock, focus/resume/boundary refresh |
| Where is TypeScript insufficient? | Untrusted JSON, stored schemas, route inputs, and native responses need runtime validation |
| How did you improve performance? | Profiled bottlenecks, virtualization, image sizing, narrow props, provider separation, cleanup; show measurements |
| Why does React.memo sometimes not help? | Changed context still updates consumers; prop stability and provider boundaries matter |
| What is mocked? | Current user, fixture enrichment, persistence-only RSVP acknowledgement, chat transport; no live backend claim |
| What makes a test meaningful? | Observable behavior and failure recovery; controlled promises; fresh-instance persistence rather than call-count assertions |
| What are the bonus platform differences? | Durable native files vs browser blobs, calendar file export, foreground web location vs native geofencing |
| How would this scale to production? | Authentication/authorization, backend idempotency and counts, paginated queries, uploads, WebSocket service, monitoring, migrations |
| What would you simplify or change next? | Use actual findings; avoid adding libraries or abstractions without a demonstrated need |

### Suggested 8–10 minute demonstration

1. Show the four required screens and explain the folder boundaries briefly.
2. Filter events, resize across 768 px, and open an event/host.
3. RSVP while persistence is deliberately delayed; show the count and My Events update immediately.
4. Trigger a failed write to show scoped rollback and retry; then save successfully and restart.
5. Open an event by direct web URL/native scheme, including an invalid ID.
6. Demonstrate each completed bonus, including a denied/cancelled optional action.
7. Run the two required tests and explain one race-condition regression test.
8. Describe measured performance, the mock data contract, and one honest production limitation.

## 13. Final submission checklist

- [ ] Every R01–R14 requirement is implemented and verified.
- [ ] B01–B04 are completed, or exact remaining limitations are explicitly recorded before submission.
- [ ] Required component and store/persistence tests pass; additional high-value regressions pass.
- [ ] Typecheck, lint, formatting, dependency checks, and web export are clean or have specifically justified limitations.
- [ ] iOS/Android/Web runtime checks and cold/warm deep-link results are recorded separately from automated tests.
- [ ] RSVP/My Events and created-event image persistence have been demonstrated after restart.
- [ ] README includes prerequisites, install/start/build/test commands, native development-build steps, data mode, demo reset/failure controls, and platform limitations.
- [ ] Technical decisions explain state management, component structure, optimistic behavior, persistence, validation, and performance tradeoffs.
- [ ] Screenshots/recording cover Discover, Event detail, My Events, and Host profile, plus implemented bonuses.
- [ ] Source/ZIP is self-contained with lockfile and licensed assets; no machine-specific absolute paths are required by the app.
- [ ] No credentials, personal location traces, dependencies, generated builds, or unrelated starter files are included.
- [ ] A clean install can reproduce the documented checks; you can explain every significant decision in your own words.
