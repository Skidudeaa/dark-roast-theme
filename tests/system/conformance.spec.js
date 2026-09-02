import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { axeFailureMessage, compactMonitor, openProof } from './proof-helpers.js';

// The public conformance checker must agree with the kernel validators against
// a real browser DOM, including markup the fixture harness renders at runtime.
// fromDom() is the adapter consumers will use in their own browser tests.

async function liveConformance(page, selector = null) {
  return page.evaluate(async (rootSelector) => {
    const module = await import('/dist/system/conformance.js');
    const target = rootSelector ? document.querySelector(rootSelector) : document;
    const report = module.checkConformance(module.fromDom(target));
    return {
      primitives: report.primitives,
      recipes: report.recipes,
      findings: module.formatFindings(report.findings),
    };
  }, selector);
}

test('primitive proof conforms in a live DOM', async ({ page }) => {
  const response = await page.goto('/spec/system/primitives.html');
  expect(response?.ok()).toBe(true);
  const report = await liveConformance(page);
  expect(report.findings).toEqual([]);
  expect(report.primitives).toBe(20);
  expect(report.recipes).toBe(0);
});

for (const scenario of compactMonitor.proofFixtures.asyncScenarios) {
  test(`compact monitor ${scenario} conforms in a live DOM`, async ({ page }) => {
    await openProof(page, { scenario });
    const report = await liveConformance(page);
    expect(report.findings).toEqual([]);
    expect(report.recipes).toBe(1);
  });
}

test('every slot mode conforms in a live DOM', async ({ page }) => {
  await openProof(page);
  const slotModes = await page.evaluate(() => window.__OI_PROOF__.slotModes);
  expect(slotModes.length).toBeGreaterThan(1);
  for (const slots of slotModes) {
    await openProof(page, { slots });
    const report = await liveConformance(page);
    expect(report.findings, `slot mode ${slots}`).toEqual([]);
  }
});

test('refresh mutation keeps the live DOM conformant', async ({ page }) => {
  const root = await openProof(page);
  await root.locator('[data-proof-refresh]').click();
  await expect(root).toHaveAttribute('aria-busy', 'true');
  const report = await liveConformance(page);
  expect(report.findings).toEqual([]);
});

test('a subtree can be checked on its own', async ({ page }) => {
  await openProof(page);
  const report = await liveConformance(page, '[data-proof-root]');
  expect(report.findings).toEqual([]);
  expect(report.recipes).toBe(1);
});

test('live DOM checker detects a runtime regression', async ({ page }) => {
  const root = await openProof(page);
  await root.evaluate((element) => {
    element.querySelector('[data-oi-slot="status"]').removeAttribute('role');
    element.setAttribute('data-oi-activity', 'loading');
    element.removeAttribute('aria-busy');
  });
  const report = await liveConformance(page);
  expect(report.findings.some((line) => line.includes('[attribute-required]'))).toBe(true);
  expect(report.findings.some((line) => line.includes('[busy-state]'))).toBe(true);
});

for (const width of [1280, 360]) {
  test(`starter page conforms, passes axe, and does not overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const response = await page.goto('/starter/index.html');
    expect(response?.ok()).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    const report = await liveConformance(page);
    expect(report.findings).toEqual([]);
    expect(report.recipes).toBe(1);
    expect(report.primitives).toBeGreaterThanOrEqual(8);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, axeFailureMessage(results.violations)).toEqual([]);

    const overflow = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
  });
}
