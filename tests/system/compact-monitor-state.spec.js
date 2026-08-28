import { test, expect } from '@playwright/test';
import {
  compactMonitor,
  expectNoInlineOverflow,
  openProof,
} from './proof-helpers.js';

const mappings = compactMonitor.proofFixtures.mappings;
const widths = compactMonitor.proofFixtures.widths;
const densities = compactMonitor.proofFixtures.densities;
const stateAxisDefaults = {
  surface: 'raised',
  activity: 'ready',
  severity: 'neutral',
  freshness: 'recent',
  certainty: 'confirmed',
  completeness: 'complete',
  source: 'direct',
};
const stateAxisOverrides = {
  neutral: { activity: 'ready', severity: 'neutral' },
  live: { activity: 'live', severity: 'informational', freshness: 'live' },
  warning: { severity: 'warning' },
  critical: { severity: 'critical' },
  disabled: {},
  stale: { freshness: 'stale' },
  uncertain: { certainty: 'uncertain', source: 'derived' },
  disputed: { certainty: 'disputed', severity: 'warning', source: 'external' },
  partial: { completeness: 'partial' },
  refreshing: { activity: 'refreshing' },
  failed: { activity: 'failed', severity: 'negative' },
};

const declaredStates = compactMonitor.proofFixtures.states;
const assertedStates = Object.keys(stateAxisOverrides);
if (
  declaredStates.length !== assertedStates.length ||
  declaredStates.some((state, index) => state !== assertedStates[index])
) {
  throw new Error(
    `state axis proof drift: expected ${declaredStates.join(', ')}, found ${assertedStates.join(', ')}`,
  );
}

for (const [index, scenario] of compactMonitor.proofFixtures.asyncScenarios.entries()) {
  test(`async ${scenario}`, async ({ page }) => {
    const root = await openProof(page, {
      scenario,
      mapping: mappings[index % mappings.length],
      width: widths[index % widths.length],
      density: densities[index % densities.length],
    });
    await expect(root).toHaveAttribute('data-proof-scenario', scenario);
    await expect(root.locator('[data-oi-slot="status"]')).toBeVisible();
    await expect(root.locator('[data-oi-slot="primary"]')).toBeVisible();
    await expect(root.locator('[data-oi-slot="primary"]')).not.toBeEmpty();

    const activity = await root.getAttribute('data-oi-activity');
    if (compactMonitor.asyncBehavior.ariaBusyActivities.includes(activity)) {
      await expect(root).toHaveAttribute('aria-busy', 'true');
    } else {
      await expect(root).not.toHaveAttribute('aria-busy', 'true');
    }

    const truth = await root.evaluate((element) => ({
      source: element.dataset.oiSource,
      freshness: element.dataset.oiFreshness,
      certainty: element.dataset.oiCertainty,
      completeness: element.dataset.oiCompleteness,
    }));
    const nonDefaultTruth =
      truth.source !== 'direct' ||
      !['live', 'recent'].includes(truth.freshness) ||
      truth.certainty !== 'confirmed' ||
      truth.completeness !== 'complete';
    if (nonDefaultTruth) {
      await expect(root.locator('#proof-status-detail')).not.toBeEmpty();
    }

    if (scenario === 'refreshing-retained') {
      await expect(root.locator('[data-oi-slot="primary"]')).toContainText('37.5');
    }
    if (scenario === 'stale') {
      await expect(root.locator('[data-oi-slot="primary"]')).toContainText('31.25');
    }
    if (scenario === 'failed') {
      await expect(root.locator('[data-oi-slot="primary"]')).toContainText('37.5');
      await expect(root.locator('.proof-details-error')).toBeVisible();
      await expect(root.locator('[data-proof-retry]')).toBeVisible();
    }
    if (scenario === 'valid-empty') {
      await expect(root).toHaveAttribute('data-oi-activity', 'ready');
      await expect(root.locator('[data-oi-slot="primary"]')).toContainText(
        'No matching results',
      );
    }
    await expectNoInlineOverflow(page, root);
  });
}

for (const [index, state] of compactMonitor.proofFixtures.states.entries()) {
  test(`state ${state}`, async ({ page }) => {
    const density = densities[(index + 1) % densities.length];
    const root = await openProof(page, {
      state,
      mapping: mappings[index % mappings.length],
      width: widths[index % widths.length],
      density,
    });
    await expect(root).toHaveAttribute('data-proof-state', state);
    await expect(root.locator('[data-proof-status-text]')).not.toBeEmpty();
    const expectedAxes = {
      ...stateAxisDefaults,
      ...stateAxisOverrides[state],
      density,
    };
    const observedAxes = await root.evaluate((element, axes) =>
      Object.fromEntries(
        axes.map((axis) => [axis, element.getAttribute(`data-oi-${axis}`)]),
      ), compactMonitor.axes);
    expect(observedAxes).toEqual(expectedAxes);
    const observedAxisAttributes = await root.evaluate((element) =>
      element
        .getAttributeNames()
        .filter((name) => name.startsWith('data-oi-'))
        .sort(),
    );
    expect(observedAxisAttributes).toEqual(
      compactMonitor.axes.map((axis) => `data-oi-${axis}`).sort(),
    );
    for (const [axis, value] of Object.entries(expectedAxes)) {
      await expect(root).toHaveAttribute(`data-oi-${axis}`, value);
    }
    if (state === 'disabled') {
      const buttons = root.locator('button');
      expect(await buttons.count()).toBeGreaterThan(0);
      for (let buttonIndex = 0; buttonIndex < (await buttons.count()); buttonIndex += 1) {
        await expect(buttons.nth(buttonIndex)).toBeDisabled();
      }
    }
    await expectNoInlineOverflow(page, root);
  });
}

test('refresh preserves primary node, retained data, and focus', async ({ page }) => {
  const root = await openProof(page, { scenario: 'ready-complete' });
  const primary = root.locator('[data-oi-slot="primary"]');
  await primary.evaluate((element) => {
    window.__proofPrimaryIdentity = element;
  });
  const retainedText = await primary.textContent();
  const refresh = root.locator('[data-proof-refresh]');
  await refresh.focus();
  await refresh.click();
  await expect(refresh).toBeFocused();
  await expect(root).toHaveAttribute('data-oi-activity', 'refreshing');
  await expect(root).toHaveAttribute('aria-busy', 'true');
  expect(await primary.textContent()).toBe(retainedText);
  expect(
    await primary.evaluate((element) => element === window.__proofPrimaryIdentity),
  ).toBe(true);
});

for (const stress of [
  'long-labels-2x',
  'large-negative-numbers',
  'missing-unknown-unavailable',
  'ltr',
  'rtl',
  'no-color',
]) {
  test(`content stress ${stress}`, async ({ page }) => {
    const root = await openProof(page, {
      stress,
      width: 'minimum-viable',
      density: 'compact',
    });
    await expect(root).toHaveAttribute('data-proof-stress', stress);
    if (stress === 'large-negative-numbers') {
      await expect(root.locator('[data-oi-slot="primary"]')).toContainText(
        '−9,223,372,036,854,775,808.125',
      );
    }
    if (stress === 'missing-unknown-unavailable') {
      await expect(root.locator('[data-oi-slot="primary"]')).toContainText('Missing');
      await expect(root.locator('[data-oi-slot="primary"]')).toContainText('Unknown');
      await expect(root.locator('[data-oi-slot="primary"]')).toContainText('Unavailable');
    }
    if (stress === 'rtl') expect(await page.locator('html').getAttribute('dir')).toBe('rtl');
    if (stress === 'ltr') expect(await page.locator('html').getAttribute('dir')).toBe('ltr');
    if (stress === 'no-color') {
      await expect(root).toHaveAttribute('data-proof-no-color', '');
      expect(await root.evaluate((element) => getComputedStyle(element).filter)).toContain(
        'grayscale',
      );
      await expect(root.locator('[data-proof-status-text]')).not.toBeEmpty();
    }
    await expectNoInlineOverflow(page, root);
  });
}
