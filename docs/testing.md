# Platform verification

## Web — 24 September 2026

Command: `npx playwright test`. Result: **4 passed** (latest screenshot refresh also checks for text-rendering console warnings) using Google Chrome.

Verified:

- Discover, event detail, host profile and My Events navigation.
- Category filtering and one/two-column layouts at 767, 768 and 769 pixels.
- At 800 × 360, Discover and My Events scroll to RSVP controls; joining and cancelling remain usable.
- Direct event links and unknown event/host states.
- Optimistic RSVP count, saved membership after reload and persisted cancellation.
- Compact fallback notices at a 390-pixel viewport, failed retries and successful recovery on all three endpoints.
- My Events restores local RSVPs without API requests.
- Valid empty responses and 404 responses do not substitute demo content.

The browsing test uses the live WireMock API. Failure/recovery tests intercept requests. Browser time is fixed to 23 September 2026 to keep the event-date assertions repeatable.

Screenshots refreshed by this run:

- [Discover](screenshots/web/discover.png)
- [Event detail](screenshots/web/event-detail.png)
- [Host profile](screenshots/web/host-profile.png)
- [My Events](screenshots/web/my-events.png)
- [Discover landscape](screenshots/web/discover-landscape.png)
- [My Events landscape](screenshots/web/my-events-landscape.png)

These are browser screenshots, not Android or iOS screenshots.

## Android — 24 September 2026

Tested on a physical OPPO CPH1937 running Android 11 through Expo Go. Display: 720 × 1600 pixels at 320 dpi (360 logical pixels wide). The development server was connected over USB for offline checks.

Verified through device interaction, UI hierarchy inspection and screenshots:

- Live Discover feed, single-column portrait layout and Tech category filtering.
- Event details, descriptions, host navigation, attendee avatars and back navigation.
- RSVP on event-3 changed its count from 124 to 125 and appeared in My Events.
- Force-stopping Expo Go and reopening restored that RSVP. Cancelling it and restarting restored the unjoined state.
- Upcoming saved events, an empty Past view, and a populated Past view after temporarily joining event-7.
- With Wi-Fi disabled and mobile data already off, Discover, event details and host profile displayed the bundled fallback and compact Retry UI.
- Host retry while offline preserved usable content. Restoring Wi-Fi and retrying recovered live content on all three endpoints and removed their notices.
- My Events remained usable offline without an API notice.
- Status icons, header, bottom tabs and Android navigation controls were visible without overlapping app content in portrait.
- Cold event and My Events URLs and warm host/event navigation were exercised using Expo Go development URLs.

The temporary event-3 and event-7 RSVPs were removed; existing user RSVPs were preserved. Wi-Fi was restored to its original enabled state; mobile data remained off.

Screenshots:

- [Discover](screenshots/android/discover.png)
- [Event details](screenshots/android/event-detail.png)
- [Host and attendees](screenshots/android/event-attendees.png)
- [Host profile](screenshots/android/host-profile.png)
- [My Events — Upcoming](screenshots/android/my-events.png)
- [My Events — Past](screenshots/android/my-events-past.png)
- [Discover offline](screenshots/android/discover-offline.png)
- [Event offline](screenshots/android/event-offline.png)
- [Host offline](screenshots/android/host-offline.png)

### Findings and limits

- On this Android 11 / Expo Go setup, the system status-bar background is black above the green app bar. Icons are readable, but the background is not theme-matched.
- Expo Go's floating developer Tools control is visible in native screenshots; it is not an app feature.
- Existing saved RSVP snapshots have older dates than the current API, as expected with the current local My Events design.
- Removed an accidental JSX space (`{' '}`) directly under the My Events header View. A fresh Expo Go process rendered both tabs without ReactNativeJS/AndroidRuntime error logs. Both Android landscape screenshots were recaptured after the fix. Web screenshots were subsequently regenerated too: the earlier web My Events image had retained the warning overlay. Browser tests now fail on these text-rendering console warnings.
- Manual rotation exposed a collapsed event list in landscape. Fixed Discover and My Events by moving headings/filters into the list header and the discovery button into its footer, with the list filling available space. Android landscape scrolling was rechecked.
- [Android Discover landscape](screenshots/android/discover-landscape.png) and [Android My Events landscape](screenshots/android/my-events-landscape.png). The phone’s usable window is below 768 logical pixels wide, so one column remains appropriate; web breakpoint tests cover two columns.
- The installed app's `eventsapp://` scheme still needs a development/release build. Expo Go route checks do not establish that custom scheme registration works.
- Native tablet layouts, release performance, screen readers and large-font settings were not tested in this session.

## iOS Simulator — blocked by installed runtime/toolchain

Checked this Mac on 24 September 2026: macOS 12.7.6, Xcode 14.2, installed iOS runtimes 14.3, 14.4 and 16.2. CoreSimulator is accessible with permission, but none of these runtimes meets this project’s minimum iOS version.

[Expo SDK 57 requirements](https://docs.expo.dev/versions/v57.0.0/) specify iOS 16.4+ and Xcode 26.4+ for native compilation. Simulator testing needs a compatible newer runtime/toolchain on a supported macOS installation or another compatible Mac. No iOS screenshots or runtime pass are claimed; a real iPhone is not required once the simulator setup is compatible.

## Physical iPhone connection — 24 September 2026

A trusted iPhone 15 Pro Max running iOS 26.7 was detected over USB. Xcode 14.2 could not prepare it: `Could not locate device support files`; its diagnostic identifies the iOS version as unsupported by this Xcode. USB launch/inspection through the installed Xcode tools is therefore blocked.

The running Expo server serves an iOS manifest for SDK 57. Its iOS development bundle also compiled and returned HTTP 200 (5,783,510 bytes); this is a bundling check, not a device runtime test. Opening the project in compatible Expo Go over the same Wi-Fi remains possible without compiling a native app with this Xcode. User-assisted launch is pending; no physical iOS runtime pass or screenshots are claimed yet.

### iOS status-bar issue reported during Expo Go testing

The user opened the project on the iPhone and reported the `UIViewControllerBasedStatusBarAppearance` warning. The root layout was configuring both the global `expo-status-bar` component and native Stack status-bar overrides. Removed the Stack overrides and kept the global component as the single owner. No Info.plist change or native rebuild is needed for this JavaScript fix. Device confirmation after a full reload remains pending.

## Packaging verification — 24 September 2026

- Removed six unused direct dependency entries (`@expo/ui`, `expo-device`, `expo-font`, `expo-glass-effect`, `expo-symbols`, `expo-web-browser`). Packages needed transitively by Expo/Router remain in the lockfile.
- Removed unused starter CSS, tutorial artwork and tab icons, the unused assets alias, unused RSVP Context seed state and unnecessary utility exports. The stored v1 envelope remains compatible with existing RSVPs.
- Separated captures into `screenshots/android/` and `screenshots/web/`; browser tests write only to the web folder.
- Reviewed the root README for platform setup, required features, technical decisions, persistence, API fallback, tests, deep links and submission instructions. Local documentation links resolve; all seven bundled event details match the WireMock collection.
- `npm run check`: TypeScript, ESLint, formatting and all 17 Jest tests passed.
- TypeScript with `--noUnusedLocals --noUnusedParameters` passed.
- `npx playwright test`: all four browser tests passed and web captures were regenerated without text-rendering console warnings.
- `npm run export:web` passed; `npx expo install --check` reported aligned dependencies; Expo Doctor passed 21/21 checks.
- Created the source ZIP with `npm run package:source`. Archive integrity and exclusion checks passed. An extracted copy in a temporary directory passed `npm ci --ignore-scripts --no-audit --no-fund` and `npm run check`, independently of the working checkout. Install lifecycle scripts were deliberately not run in this packaging check.
- npm still reports 14 moderate transitive audit findings. No forced dependency upgrades or SDK downgrades were applied during cleanup.

The archive excludes dependencies, local environment files, caches, generated outputs, VCS data and local agent/planning files. Native iOS confirmation and installed-build deep-link checks remain pending as recorded above; packaging does not change those verification limits.
