import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import {
  axeFailureMessage,
  compactMonitor,
  expectNoInlineOverflow,
  openProof,
} from './proof-helpers.js';

async function expectAxeClean(page) {
  const results = await new AxeBuilder({ page })
    .include('.proof-mapping')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations, axeFailureMessage(results.violations)).toEqual([]);
}

for (const mapping of compactMonitor.proofFixtures.mappings) {
  test(`axe mapping ${mapping}`, async ({ page }) => {
    await openProof(page, { mapping, scenario: 'ready-complete' });
    await expectAxeClean(page);
  });
}

for (const [index, scenario] of compactMonitor.proofFixtures.asyncScenarios.entries()) {
  test(`axe async ${scenario}`, async ({ page }) => {
    await openProof(page, {
      scenario,
      mapping:
        compactMonitor.proofFixtures.mappings[
          index % compactMonitor.proofFixtures.mappings.length
        ],
    });
    await expectAxeClean(page);
  });
}

test('native disclosure supports click, Space, and Enter', async ({ page }) => {
  const root = await openProof(page);
  const details = root.locator('details.oi-disclosure');
  const summary = details.locator('summary');
  await expect(details).not.toHaveAttribute('open', '');
  await summary.click();
  await expect(details).toHaveAttribute('open', '');
  await summary.focus();
  await page.keyboard.press('Space');
  await expect(details).not.toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
});

test('keyboard focus follows DOM order and exposes a visible ring', async ({ page }) => {
  const root = await openProof(page);
  const candidates = root.locator(
    'button:not(:disabled), a[href], summary, input:not(:disabled), select:not(:disabled), textarea:not(:disabled)',
  );
  const expected = await candidates.evaluateAll((nodes) =>
    nodes.map((node) => `${node.tagName}:${node.textContent.trim()}`),
  );
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  const observed = [];
  for (let index = 0; index < expected.length; index += 1) {
    await page.keyboard.press('Tab');
    observed.push(
      await page.locator(':focus').evaluate(
        (node) => `${node.tagName}:${node.textContent.trim()}`,
      ),
    );
    const focusStyle = await page.locator(':focus').evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(focusStyle.outlineStyle).not.toBe('none');
    expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);
  }
  expect(observed).toEqual(expected);
});

test('reduced motion removes transitions without removing state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const root = await openProof(page, { stress: 'reduced-motion', state: 'refreshing' });
  const durations = await root.evaluate((element) =>
    getComputedStyle(element).transitionDuration.split(',').map((value) => value.trim()),
  );
  expect(durations.every((duration) => duration === '0s')).toBe(true);
  await expect(root.locator('[data-proof-status-text]')).toContainText('Refreshing');
});

test('increased contrast preserves strong visible boundaries', async ({ page }) => {
  await page.emulateMedia({ contrast: 'more' });
  const root = await openProof(page, { stress: 'increased-contrast' });
  const border = await root.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.borderInlineStartColor,
      style: style.borderInlineStartStyle,
      width: Number.parseFloat(style.borderInlineStartWidth),
    };
  });
  expect(border.style).not.toBe('none');
  expect(border.width).toBeGreaterThanOrEqual(1);
  expect(border.color).not.toBe('rgba(0, 0, 0, 0)');
});

test('forced colors remains operable and axe-clean', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const root = await openProof(page, { stress: 'forced-colors', state: 'critical' });
  const refresh = root.locator('[data-proof-refresh]');
  await refresh.focus();
  const outline = await refresh.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(outline.style).not.toBe('none');
  expect(outline.width).toBeGreaterThanOrEqual(2);
  await expectAxeClean(page);
});

test('200 percent equivalent reflow has no document inline overflow', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 1000 });
  const root = await openProof(page, {
    stress: 'zoom-200-reflow',
    width: 'minimum-viable',
    density: 'compact',
  });
  await expectNoInlineOverflow(page, root);
  await expect(root.locator('[data-oi-slot="status"]')).toBeVisible();
  await expect(root.locator('[data-oi-slot="primary"]')).toBeVisible();
});

test('touch-capable hybrid devices retain touch-sized controls', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    hasTouch: true,
    viewport: { width: 1024, height: 1366 },
  });
  const page = await context.newPage();
  const root = await openProof(page);
  const report = await root.locator('button').first().evaluate((element) => {
    const rootStyle = getComputedStyle(document.querySelector('.oi-root'));
    const box = element.getBoundingClientRect();
    return {
      anyCoarse: matchMedia('(any-pointer: coarse)').matches,
      height: box.height,
      touchMinimum: Number.parseFloat(
        rootStyle.getPropertyValue('--oi-interaction-touch-target-min'),
      ),
      width: box.width,
    };
  });
  expect(report.anyCoarse).toBe(true);
  expect(report.width).toBeGreaterThanOrEqual(report.touchMinimum);
  expect(report.height).toBeGreaterThanOrEqual(report.touchMinimum);
  await context.close();
});

const visualCases = [
  ['dark-ready', { mapping: 'dark-roast', width: 'preferred', density: 'standard' }],
  ['night-shift-ready', { mapping: 'night-shift', width: 'preferred', density: 'standard' }],
  ['house-blend-ready', { mapping: 'house-blend', width: 'preferred', density: 'standard' }],
  ['alien-ready', { mapping: 'alien', width: 'preferred', density: 'standard' }],
  ['narrow-long-labels', { width: 'minimum-viable', density: 'compact', stress: 'long-labels-2x' }],
  ['wide-refreshing', { width: 'wide', scenario: 'refreshing-retained' }],
  ['rtl', { width: 'minimum-viable', stress: 'rtl' }],
  ['no-color', { width: 'preferred', stress: 'no-color', state: 'warning' }],
];

for (const [name, options] of visualCases) {
  test(`visual ${name}`, async ({ page }) => {
    const root = await openProof(page, options);
    await expect(root).toHaveScreenshot(`compact-monitor-${name}.png`);
  });
}

test('visual forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const root = await openProof(page, {
    stress: 'forced-colors',
    state: 'critical',
  });
  await expect(root).toHaveScreenshot('compact-monitor-forced-colors.png');
});
