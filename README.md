# Gather — Community Events

An Expo / React Native assessment app for discovering events, viewing hosts, and saving RSVPs. Built with TypeScript, Expo Router, Context + `useReducer`, AsyncStorage and `expo-image`. The four core screens are implemented; bonus features are excluded.

## Run

Requires Node.js 22.13+ and npm.

```sh
npm ci
npm start
```

Open the project in an Expo Go version compatible with **SDK 57**, using the terminal QR code. Keep the phone and computer on the same Wi-Fi. Physical iOS Expo Go may require Expo CLI and Expo Go to be signed in to the same Expo account.

Platform shortcuts:

```sh
npm run android  # Connected Android device or emulator
npm run ios      # Compatible iOS Simulator; macOS/Xcode required
npm run web      # Web browser
```

SDK 57 requires iOS 16.4+; compiling a native iOS build requires Xcode 26.4+. Opening the project on a compatible physical iPhone in Expo Go does not require local native compilation. See the [Expo SDK requirements](https://docs.expo.dev/versions/v57.0.0/).

## Features

- Discover with cover images, dates, locations, attendee counts and category filters.
- Event details with descriptions, host information and attendee avatar previews.
- Host profiles with hosted events.
- Optimistic RSVP/cancellation, save-failure rollback and retry.
- Persistent My Events with Upcoming/Past views, a Refresh button and pull-to-refresh.
- Saved RSVP details synchronized from successful live event and host responses.
- Confirmed reset for unreadable saved data, with retry if resetting fails.
- One-column grid below 768 logical pixels; two columns at or above 768.
- Scrollable screen headers so event controls remain reachable in landscape.
- Loading, empty, error and bundled-data fallback states; light/dark themes.

## API and demo data

The default public API base URL is `https://dgm45.wiremockapi.cloud`. To change it, copy `.env.example` to `.env.local`, set `EXPO_PUBLIC_API_URL` (without `/api`), then restart Expo. This URL is public configuration, not a secret.

| Endpoint               | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `GET /api/events`      | Event summaries for Discover and My Events refresh |
| `GET /api/events/{id}` | Full details, embedded host and attendee previews  |
| `GET /api/hosts/{id}`  | Host profile and hosted event summaries            |

Requests time out after 15 seconds. On browsing screens, API failures or invalid responses use matching data from `src/data/events.json` and show a notice with Retry. Valid empty lists and event/host 404 responses are respected. Missing resources without a fallback show an error. My Events refresh preserves its saved snapshots on failure instead of replacing them with demo data. There is no general API-response cache.

The API returns bare arrays/objects. Event summaries include `id`, `title`, `category`, `date`, `endDate`, `timeZone`, `location`, `attendeeCount`, `hostId`, `hostName` and `imageUrl`. Details add `description`, an embedded `host` and `attendeePreview`; host profiles include their `events`. For example, `hostId: "maya"` identifies the profile, while `hostName: "Maya Chen"` is its display name. There is no RSVP mutation endpoint; membership is saved locally.

Images are remote Unsplash URLs; failed images use local placeholders or initials. Some demo events intentionally have no cover image.

The bundled dataset contains seven events with fixed dates: six on October 1–6, 2026 and **Our first community picnic** on September 20, 2026. Dates are not shifted on launch; Upcoming/Past uses the device’s current time, so all these events will eventually appear in Past. To demonstrate Past RSVPs after September 20, join the picnic and open **My Events → Past**. The demo permits joining past events. Update the hosted mock API and bundled data together when renewing the demo dates.

## Technical decisions

**Navigation and components.** Expo Router provides the required file-based stack and tabs, with thin routes rendering separate screens. `EventCard`, `EventGrid`, `RsvpButton`, `AppBar` and shared state UI keep presentation reusable. The root `expo-status-bar` component controls status-bar appearance; native Stack overrides are intentionally omitted to avoid the iOS Expo Go configuration conflict.

**Styling and reuse.** `theme/colors.ts` owns the light/dark palette, `theme/typography.ts` defines text styles, and `theme/layout.ts` holds shared dimensions and the grid breakpoint. Components use named props types and local `StyleSheet` definitions. Theme-dependent styles use `createStyles(palette)`; shared buttons provide pressed, disabled and selected states. `FilterTabs`, `Button`, `Page`, `StateView`, `AppText`, `Cover` and `Avatar` are reusable building blocks. `AppText` applies shared typography variants and theme tones while forwarding native text props and style overrides. Fixed UI copy and dynamic message templates live in `constants/strings.ts`, grouped by screen and purpose. API content stays in the data layer; screen-specific geometry stays beside its screen. There is no additional state or styling library.

**State.** Context + `useReducer` owns RSVP membership, pending saves and errors. Filters stay local to screens. All screens derive attendee counts from the API baseline plus the current user's RSVP; the mock baseline excludes that user.

**Persistence.** AsyncStorage stores joined event snapshots under `community-events:state:v1`. UI updates immediately, writes run in order, and a failed write rolls back its own change. Startup restores saved data before enabling RSVP. My Events opens immediately from saved snapshots. Its Refresh button and pull-to-refresh fetch live event summaries. Successful live responses from Discover, event details and host profiles also update matching saved RSVPs through the same ordered storage queue. Refreshing never adds or removes membership; missing events remain saved, and bundled fallback data never overwrites snapshots. Failed refresh writes preserve the previous snapshots and show an error in My Events. Legacy fields remain readable for existing users. Unreadable saved data is preserved until the user confirms Reset saved RSVPs. Reset replaces only the app’s RSVP data; failed resets show an error and allow retry.

**API and validation.** Three fetch functions check HTTP status, validate JSON and supply sample fallbacks. Requests have a 15-second timeout covering both the response and JSON body; timed-out requests use the same fallback/error handling as other failures. `useResource` shares loading/retry state and cancels obsolete requests. `useEventResource` connects successful live responses to saved-snapshot synchronization. TypeScript checks application code; runtime validation checks external JSON and saved data. `useClock` refreshes Upcoming/Past classification once per minute while focused, immediately on focus, and on app resume. An event remains Upcoming until its end time, or its start time when no end is supplied.

## Structure

```text
src/
  app/          # Expo Router routes and layouts
  screens/      # Four core screens
  components/   # Named reusable UI components
  theme/        # Colors, typography and shared layout values
  constants/    # Shared UI strings
  services/     # API functions
  store/        # RSVP Context and reducer
  hooks/        # Requests, snapshot synchronization and clock
  types/        # Shared TypeScript types
  utils/        # Validation, dates and storage
  data/         # Bundled fallback events
  test/         # Jest tests and setup
e2e/            # Playwright browser tests
docs/
  screenshots/android/
  screenshots/web/
```

## Checks and screenshots

```sh
npm run check        # TypeScript, ESLint, Prettier, 29 Jest tests
npm run test:e2e     # 6 Playwright tests; installed Google Chrome required
npm run export:web  # Production web bundle in dist/
npx expo install --check
npx expo-doctor
```

Component tests verify RSVP count/selection changes. My Events screen tests cover Upcoming/Past filtering, cancellation across remounts, refreshed dates/counts, offline fallback, failed refresh writes, and synchronization from Discover. Store tests verify add/remove, restoration and rollback. API tests cover validation, failures, fallback, cancellation and response/body timeouts. Recovery tests verify reset confirmation, cancellation and failed storage writes. Browser tests cover navigation, responsive layouts, persistence, offline retry, landscape scrolling, refreshed events moving to Past, and confirmed reset. The main browsing test requires the live mock API; other scenarios intercept requests. Browser time is fixed for repeatable date assertions. Screenshot captures wait for remote photos to load, so those checks also require access to the image host.

| Screen        | Web                                                 | Android                                                 |
| ------------- | --------------------------------------------------- | ------------------------------------------------------- |
| Discover      | [Screenshot](docs/screenshots/web/discover.png)     | [Screenshot](docs/screenshots/android/discover.png)     |
| Event details | [Screenshot](docs/screenshots/web/event-detail.png) | [Screenshot](docs/screenshots/android/event-detail.png) |
| My Events     | [Screenshot](docs/screenshots/web/my-events.png)    | [Screenshot](docs/screenshots/android/my-events.png)    |
| Host profile  | [Screenshot](docs/screenshots/web/host-profile.png) | [Screenshot](docs/screenshots/android/host-profile.png) |

Last recorded verification: **24 September 2026**. TypeScript, lint, formatting, all **29 Jest tests** and all **6 Chrome browser tests** passed. The physical **Oppo CPH1937 running Android 11 in Expo Go** was checked for navigation, category filtering, RSVP persistence after restart, Upcoming/Past views, saved-event refresh, offline fallback, retry and landscape scrolling.

Additional captures show [refreshed Past events](docs/screenshots/web/my-events-refresh-past.png), [web offline refresh](docs/screenshots/web/my-events-refresh-offline.png), [reset confirmation](docs/screenshots/web/saved-data-recovery.png), [Android Past RSVPs](docs/screenshots/android/my-events-past.png), and [Android offline refresh](docs/screenshots/android/my-events-refresh-offline.png).

Known visual limitations from that run:

- The Oppo briefly showed dark status-bar icons against the green background after rotation; a cold restart restored white icons on black. The cause has not been isolated in a standalone build.
- Large covers require extra scrolling in short landscape viewports, but RSVP controls remain reachable. See [Android Discover landscape](docs/screenshots/android/discover-landscape.png) and [My Events landscape](docs/screenshots/android/my-events-landscape.png).
- Expo Go’s floating Tools control appears in some Android screenshots; it is not app UI.

The project author reported manual iOS testing. Automated iOS checks, iOS screenshots, physical tablet testing and standalone native-build verification were not performed in this test run. Corrupt-storage recovery was tested through Jest and Chrome without modifying the phone’s existing saved data.

## Deep links and web deployment

Web routes include `/event/event-1` and `/host/maya`. A deployment server must rewrite unknown paths to `dist/index.html` for direct URLs to work.

The configured native scheme is `eventsapp://event/event-1`. Testing that scheme requires an installed native build, for example through `npx expo run:android` or `npx expo run:ios` with compatible native tooling. Expo Go development links do not verify custom-scheme registration. Installed-build cold/warm scheme tests remain pending.

## Package the source

```sh
npm run package:source
```

Requires Python 3. Creates `artifacts/community-events-source.zip` with source, lockfile, configuration, tests, assets, documentation and platform screenshots. It excludes `node_modules`, local environment values, `.git`, Expo caches, generated native projects, build output, test reports and local planning/agent files. Extract the ZIP, run `npm ci`, then follow the commands above.

This is a single-user demo with local RSVP persistence: no authentication, membership backend or cross-device synchronization. Create-event, chat, calendar and nearby-event bonuses are not implemented. The repository retains the Expo starter's license; remote photos and mock profiles are demo content.
