import { expect, test, type Page } from '@playwright/test';
import catalog from '../src/data/events.json';
const textWarnings = new WeakMap<Page, string[]>();

async function waitForImages(page: Page) {
  await expect(page.locator('img').first()).toBeAttached();
  await expect
    .poll(
      () =>
        page
          .locator('img')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth > 0,
            ),
          ),
      { timeout: 15000 },
    )
    .toBe(true);
}
test.beforeEach(async ({ page }) => {
  const warnings: string[] = [];
  textWarnings.set(page, warnings);
  page.on('console', (message) => {
    if (
      /Unexpected text node|Text strings must be rendered/.test(message.text())
    ) {
      warnings.push(message.text());
    }
  });
  await page.clock.setFixedTime(new Date('2026-09-23T12:00:00Z'));
});
test.afterEach(async ({ page }) => {
  expect(textWarnings.get(page)).toEqual([]);
});
test('four screens, responsive breakpoint, direct links and durable RSVP', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByText('Find your people.')).toBeVisible();
  const first = page.getByRole('button', {
    name: 'View Sunset sessions in the park',
    exact: true,
  });
  await expect(first).toBeVisible();
  await expect(
    page.getByText('Showing demo data. Live data unavailable.', {
      exact: true,
    }),
  ).toHaveCount(0);
  await waitForImages(page);
  await page.screenshot({
    path: 'docs/screenshots/web/discover.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Tech', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'View Build something together' }),
  ).toBeVisible();
  await expect(first).toHaveCount(0);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  for (const width of [767, 768, 769]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(async () => {
        const a = await first.boundingBox();
        const b = await page
          .getByRole('button', { name: 'View A good morning run' })
          .boundingBox();
        if (!a || !b) return null;
        return Math.abs(a.y - b.y) < 5;
      })
      .toBe(width >= 768);
  }
  await page.setViewportSize({ width: 1100, height: 900 });
  await first.click();
  await expect(page.getByText('About this gathering')).toBeVisible();
  await page.getByRole('button', { name: '+ RSVP', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '✓ Going · Cancel RSVP', exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole('heading', { name: '49 attending', exact: true }),
  ).toBeVisible();
  await waitForImages(page);
  await page.screenshot({
    path: 'docs/screenshots/web/event-detail.png',
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole('button', { name: '✓ Going · Cancel RSVP', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Meet your host' }).click();
  await expect(page.getByText('Hosted gatherings')).toBeVisible();
  await expect(
    page.getByText('Showing demo data. Live data unavailable.', {
      exact: true,
    }),
  ).toHaveCount(0);
  await waitForImages(page);
  await page.screenshot({
    path: 'docs/screenshots/web/host-profile.png',
    fullPage: true,
  });
  await page.goto('/my-events');
  await expect(first).toBeVisible();
  await waitForImages(page);
  await page.screenshot({
    path: 'docs/screenshots/web/my-events.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: '✓ Going · Cancel RSVP', exact: true })
    .click();
  await expect(page.getByText('No upcoming RSVPs')).toBeVisible();
  await page.reload();
  await expect(page.getByText('No upcoming RSVPs')).toBeVisible();
  await page.goto('/event/event-2');
  await expect(page.getByText('About this gathering')).toBeVisible();
  await page.goto('/event/unknown');
  await expect(page.getByText('Event not found')).toBeVisible();
  expect(errors).toEqual([]);
});

test('compact fallback retries recover every endpoint and My Events stays local', async ({
  page,
}) => {
  let unavailable = true;
  const requests: string[] = [];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://dgm45.wiremockapi.cloud/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    requests.push(path);
    if (unavailable) return route.abort('failed');
    // Make pending retry feedback observable, without depending on the live service.
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (path === '/api/events') {
      await route.fulfill({
        json: catalog.map((e) => ({ ...e, title: `API: ${e.title}` })),
      });
    } else if (path === '/api/events/event-1') {
      await route.fulfill({
        json: { ...catalog[0], title: 'API: event details' },
      });
    } else {
      await route.fulfill({
        json: {
          ...catalog[0]!.host,
          name: 'API: host profile',
          events: catalog
            .filter((e) => e.hostId === 'maya')
            .map((e) => ({ ...e, hostName: 'API: host profile' })),
        },
      });
    }
  });
  const notice = page.getByText('Showing demo data. Live data unavailable.', {
    exact: true,
  });
  for (const [path, recoveredTitle] of [
    ['/', 'API: Sunset sessions in the park'],
    ['/event/event-1', 'API: event details'],
    ['/host/maya', 'API: host profile'],
  ]) {
    unavailable = true;
    await page.goto(path!);
    await expect(notice).toBeVisible();
    const banner = notice.locator('..');
    expect((await banner.boundingBox())!.height).toBeLessThan(90);
    // A failed retry keeps content and allows another attempt.
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Retry', exact: true }),
    ).toBeEnabled();
    await expect(notice).toBeVisible();
    unavailable = false;
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Retrying', exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByText(recoveredTitle!, { exact: true }),
    ).toBeVisible();
    await expect(notice).toHaveCount(0);
  }
  // Join offline, then restore the saved event with no My Events API request.
  unavailable = true;
  await page.goto('/event/event-1');
  await expect(notice).toBeVisible();
  await page.getByRole('button', { name: '+ RSVP', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '✓ Going · Cancel RSVP', exact: true }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Go back', exact: true }).click();
  await expect(page.getByText('Find your people.')).toBeVisible();
  const before = requests.length;
  await page.goto('/my-events');
  await expect(
    page.getByRole('button', {
      name: 'View Sunset sessions in the park',
      exact: true,
    }),
  ).toBeVisible();
  await expect(notice).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('button', {
      name: 'View Sunset sessions in the park',
      exact: true,
    }),
  ).toBeVisible();
  expect(requests.length).toBe(before);
  await page.goto('/');
  await expect(notice).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'View Sunset sessions in the park',
      exact: true,
    }),
  ).toBeVisible();
});

test('valid empty and not-found API responses do not show demo content', async ({
  page,
}) => {
  await page.route('https://dgm45.wiremockapi.cloud/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    await route.fulfill(
      path === '/api/events'
        ? { json: [] }
        : { status: 404, json: { error: { code: 'NOT_FOUND' } } },
    );
  });
  await page.goto('/');
  await expect(page.getByText('No events available')).toBeVisible();
  await expect(
    page.getByText('Showing demo data. Live data unavailable.', {
      exact: true,
    }),
  ).toHaveCount(0);
  await page.goto('/event/event-1');
  await expect(page.getByText('Event not found')).toBeVisible();
  await expect(page.getByText('About this gathering')).toHaveCount(0);
  await page.goto('/host/maya');
  await expect(page.getByText('Host not found')).toBeVisible();
});

test('short landscape screens can scroll to events and RSVP controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 360 });
  await page.route('https://dgm45.wiremockapi.cloud/**', (route) =>
    route.fulfill({
      json:
        new URL(route.request().url()).pathname === '/api/events'
          ? catalog
          : catalog[0],
    }),
  );
  await page.goto('/');
  const join = page
    .getByRole('button', { name: '+ RSVP', exact: true })
    .first();
  await join.scrollIntoViewIfNeeded();
  await expect(join).toBeInViewport();
  await join.click();
  await expect(
    page.getByRole('button', { name: '✓ Going · Cancel RSVP', exact: true }),
  ).toBeEnabled();
  await waitForImages(page);
  await page.screenshot({
    path: 'docs/screenshots/web/discover-landscape.png',
  });
  await page.goto('/my-events');
  const cancel = page.getByRole('button', {
    name: '✓ Going · Cancel RSVP',
    exact: true,
  });
  await cancel.scrollIntoViewIfNeeded();
  await expect(cancel).toBeInViewport();
  await waitForImages(page);
  await page.screenshot({
    path: 'docs/screenshots/web/my-events-landscape.png',
  });
  await cancel.click();
  await expect(page.getByText('No upcoming RSVPs')).toBeVisible();
});

test('saved-event refresh updates dates and counts, persists, and preserves data offline', async ({
  page,
}) => {
  let updated = false;
  let offline = false;
  const revised = {
    ...catalog[0]!,
    title: 'Rescheduled sunset session',
    date: '2026-09-20T14:00:00Z',
    endDate: '2026-09-20T16:00:00Z',
    attendeeCount: 60,
  };
  await page.route('https://dgm45.wiremockapi.cloud/**', (route) => {
    if (offline) return route.abort('failed');
    return route.fulfill({
      json:
        new URL(route.request().url()).pathname === '/api/events'
          ? updated
            ? [revised]
            : catalog
          : catalog[0],
    });
  });
  await page.goto('/event/event-1');
  await page.getByRole('button', { name: '+ RSVP', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '✓ Going · Cancel RSVP', exact: true }),
  ).toBeEnabled();
  await page.goto('/my-events');
  await expect(
    page.getByText(catalog[0]!.title, { exact: true }),
  ).toBeVisible();
  updated = true;
  await page
    .getByRole('button', { name: 'Refresh saved events', exact: true })
    .click();
  await expect(page.getByText('No upcoming RSVPs')).toBeVisible();
  await page.getByRole('button', { name: 'Past', exact: true }).click();
  await expect(page.getByText(revised.title, { exact: true })).toBeVisible();
  await expect(page.getByText('61 attending', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Past', exact: true }).click();
  await expect(page.getByText(revised.title, { exact: true })).toBeVisible();
  await waitForImages(page);
  await page.screenshot({
    path: 'docs/screenshots/web/my-events-refresh-past.png',
    fullPage: true,
  });
  offline = true;
  await page
    .getByRole('button', { name: 'Refresh saved events', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText(
    'Could not refresh events',
  );
  await expect(page.getByText(revised.title, { exact: true })).toBeVisible();
  await waitForImages(page);
  await page.screenshot({
    path: 'docs/screenshots/web/my-events-refresh-offline.png',
    fullPage: true,
  });
});

test('corrupt saved data requires confirmation before resetting', async ({
  page,
}) => {
  await page.route('https://dgm45.wiremockapi.cloud/**', (route) =>
    route.fulfill({ json: catalog }),
  );
  await page.goto('/');
  await expect(page.getByText('Find your people.')).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem('community-events:state:v1', 'broken json'),
  );
  await page.reload();
  await expect(page.getByText('Saved events unavailable')).toBeVisible();
  await page
    .getByRole('button', { name: 'Reset saved RSVPs', exact: true })
    .click();
  await page.screenshot({
    path: 'docs/screenshots/web/saved-data-recovery.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'Keep saved RSVPs', exact: true })
    .click();
  expect(
    await page.evaluate(() =>
      localStorage.getItem('community-events:state:v1'),
    ),
  ).toBe('broken json');
  await page
    .getByRole('button', { name: 'Reset saved RSVPs', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Remove saved RSVPs and continue',
      exact: true,
    })
    .click();
  await expect(page.getByText('Find your people.')).toBeVisible();
  await page.goto('/my-events');
  await expect(page.getByText('No upcoming RSVPs')).toBeVisible();
});
