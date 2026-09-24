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
- Persistent My Events with Upcoming/Past views.
- One-column grid below 768 logical pixels; two columns at or above 768.
- Scrollable screen headers so event controls remain reachable in landscape.
- Loading, empty, error and bundled-data fallback states; light/dark themes.

## API and demo data

The default public API base URL is `https://dgm45.wiremockapi.cloud`. To change it, copy `.env.example` to `.env.local`, set `EXPO_PUBLIC_API_URL` (without `/api`), then restart Expo. This URL is public configuration, not a secret.

| Endpoint               | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `GET /api/events`      | Discover summaries; categories are filtered locally |
| `GET /api/events/{id}` | Full details, embedded host and attendee previews   |
| `GET /api/hosts/{id}`  | Host profile and hosted event summaries             |

API failures or invalid responses use `src/data/events.json` and show a compact notice with Retry. Successful empty lists and 404 responses are respected. Missing resources without a fallback show an error. There is no API-response cache.

The [WireMock collection and import instructions](docs/wiremock/README.md) include error and empty-response variants. Images are remote Unsplash URLs; failed images use local UI placeholders/initials.

Demo events use fixed dates: October 1–6, 2026 and September 20, 2026. They are not shifted on launch. To test Past RSVPs, join **Our first community picnic** and open **My Events → Past**. The demo permits joining past events. Update the mock collection and bundled data together if refreshing the demo dates.

## Technical decisions

**Navigation and components.** Expo Router provides the required file-based stack and tabs, with thin routes rendering separate screens. `EventCard`, `EventGrid`, `RsvpButton`, `AppBar` and shared state UI keep presentation reusable. The root `expo-status-bar` component controls status-bar appearance; native Stack overrides are intentionally omitted to avoid the iOS Expo Go configuration conflict.

**State.** Context + `useReducer` owns RSVP membership, pending saves and errors. Filters stay local to screens. All screens derive attendee counts from the API baseline plus the current user's RSVP; the mock baseline excludes that user.

**Persistence.** AsyncStorage stores joined event snapshots under `community-events:state:v1`. UI updates immediately, writes run in order, and a failed write rolls back its own change. Startup restores saved data before enabling RSVP. My Events reads saved snapshots without an API request, so those details reflect the time they were saved. Legacy fields remain readable for existing users. Corrupt saved data is preserved and reported; an in-app reset flow is not implemented.

**API and validation.** Three fetch functions check HTTP status, validate JSON and supply sample fallbacks. `useResource` shares loading/retry state and cancels obsolete requests. TypeScript checks application code; runtime validation checks external JSON and saved data. `useClock` refreshes Upcoming/Past classification while focused and on app resume. An event remains Upcoming until its end time, or its start time when no end is supplied.

## Structure

```text
src/
  app/          # Expo Router routes and layouts
  screens/      # Four core screens
  components/   # Shared UI
  services/     # API functions
  store/        # RSVP Context and reducer
  hooks/        # Request state and clock
  types/        # Shared TypeScript types
  utils/        # Validation, dates and storage
  data/         # Bundled fallback events
  test/         # Jest tests and setup
e2e/            # Playwright browser tests
docs/
  screenshots/android/
  screenshots/web/
  wiremock/
  testing.md
```

## Checks and screenshots

```sh
npm run check        # TypeScript, ESLint, Prettier, 17 Jest tests
npm run test:e2e     # 4 Playwright tests; installed Google Chrome required
npm run export:web  # Production web bundle in dist/
npx expo install --check
npx expo-doctor
```

The component test verifies RSVP count/selection changes. Store tests verify add/remove, restoration and rollback. API tests cover validation, failures, fallback and cancellation. Browser tests cover navigation, responsive layouts, persistence, offline retry and landscape scrolling. The main browsing test requires the live mock API; other scenarios intercept requests. Browser time is fixed for repeatable date assertions.

| Screen        | Web                                                 | Android                                                 |
| ------------- | --------------------------------------------------- | ------------------------------------------------------- |
| Discover      | [Screenshot](docs/screenshots/web/discover.png)     | [Screenshot](docs/screenshots/android/discover.png)     |
| Event details | [Screenshot](docs/screenshots/web/event-detail.png) | [Screenshot](docs/screenshots/android/event-detail.png) |
| My Events     | [Screenshot](docs/screenshots/web/my-events.png)    | [Screenshot](docs/screenshots/android/my-events.png)    |
| Host profile  | [Screenshot](docs/screenshots/web/host-profile.png) | [Screenshot](docs/screenshots/android/host-profile.png) |

See [platform test results](docs/testing.md) for landscape/offline screenshots and verification limits. Android was checked on a physical Android 11 phone in Expo Go. Its status-bar background is black in portrait; Expo Go's floating developer control appears in captures. Some portrait screenshots precede the landscape scrolling adjustment. iOS was opened by the user; a reported status-bar warning was addressed, but device confirmation and a complete iOS test pass are pending.

## Deep links and web deployment

Web routes include `/event/event-1` and `/host/maya`. A deployment server must rewrite unknown paths to `dist/index.html` for direct URLs to work.

The configured native scheme is `eventsapp://event/event-1`. Testing that scheme requires an installed native build, for example through `npx expo run:android` or `npx expo run:ios` with compatible native tooling. Expo Go development links do not verify custom-scheme registration. Installed-build cold/warm scheme tests remain pending.

## Package the source

```sh
npm run package:source
```

Requires Python 3. Creates `artifacts/community-events-source.zip` with source, lockfile, configuration, tests, assets, documentation and platform screenshots. It excludes `node_modules`, local environment values, `.git`, Expo caches, generated native projects, build output, test reports and local planning/agent files. Extract the ZIP, run `npm ci`, then follow the commands above.

This is a single-user demo with local RSVP persistence: no authentication, membership backend or cross-device synchronization. Create-event, chat, calendar and nearby-event bonuses are not implemented. The repository retains the Expo starter's license; remote photos and mock profiles are demo content.
