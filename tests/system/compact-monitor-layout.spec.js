import { test, expect } from '@playwright/test';
import {
  compactMonitor,
  contentInlineSize,
  expectedCssLength,
  expectNoInlineOverflow,
  openProof,
} from './proof-helpers.js';

const expectedColumns = {
  'minimum-viable': 1,
  preferred: 2,
  wide: 3,
};

for (const mapping of compactMonitor.proofFixtures.mappings) {
  for (const width of compactMonitor.proofFixtures.widths) {
    for (const density of compactMonitor.proofFixtures.densities) {
      test(`layout ${mapping} ${width} ${density}`, async ({ page }) => {
        const root = await openProof(page, { mapping, width, density });
        await expect(root).toHaveAttribute('data-proof-mapping', mapping);
        await expect(root).toHaveAttribute('data-proof-width', width);
        await expect(root).toHaveAttribute('data-oi-density', density);

        for (const slot of compactMonitor.requiredSlots) {
          const locator = root.locator(`[data-oi-slot="${slot}"]`);
          await expect(locator).toHaveCount(1);
          await expect(locator).toBeVisible();
        }

        const slots = await root.locator('[data-oi-slot]').evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute('data-oi-slot')),
        );
        expect(slots).toEqual(compactMonitor.slotOrder);

        const emptyOptionalSlots = await root.evaluate((element, optionalSlots) =>
          optionalSlots.filter((slot) => {
            const node = element.querySelector(`[data-oi-slot="${slot}"]`);
            return node && !node.textContent.trim();
          }), compactMonitor.optionalSlots);
        expect(emptyOptionalSlots).toEqual([]);

        const measuredWidth = await contentInlineSize(root);
        const expectedWidth = await expectedCssLength(
          page,
          compactMonitor.widths[
            width === 'minimum-viable'
              ? 'minimumViable'
              : width
          ],
        );
        expect(Math.abs(measuredWidth - expectedWidth)).toBeLessThanOrEqual(1);

        const columnCount = await root
          .locator('[data-oi-slot="primary"]')
          .evaluate((element) =>
            getComputedStyle(element).gridTemplateColumns.split(/\s+/).filter(Boolean)
              .length,
          );
        expect(columnCount).toBe(expectedColumns[width]);
        await expectNoInlineOverflow(page, root);
      });
    }
  }
}

const slotModeExpectations = {
  full: compactMonitor.slotOrder,
  'required-only': compactMonitor.requiredSlots,
  'no-chrome': ['focus', 'status', 'primary', 'details', 'history', 'settings'],
  'omit-context': compactMonitor.slotOrder.filter((slot) => slot !== 'context'),
  'omit-actions': compactMonitor.slotOrder.filter((slot) => slot !== 'actions'),
  'omit-focus': compactMonitor.slotOrder.filter((slot) => slot !== 'focus'),
  'omit-details': compactMonitor.slotOrder.filter((slot) => slot !== 'details'),
  'omit-history': compactMonitor.slotOrder.filter((slot) => slot !== 'history'),
  'omit-settings': compactMonitor.slotOrder.filter((slot) => slot !== 'settings'),
};

for (const [slots, expected] of Object.entries(slotModeExpectations)) {
  test(`optional collapse ${slots}`, async ({ page }) => {
    const root = await openProof(page, { slots, width: 'preferred' });
    const observed = await root.locator('[data-oi-slot]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-oi-slot')),
    );
    expect(observed).toEqual(expected);
    const chrome = root.locator('.oi-recipe-compact-monitor__chrome');
    await expect(chrome).toHaveCount(
      expected.includes('context') || expected.includes('actions') ? 1 : 0,
    );
    await expectNoInlineOverflow(page, root);
  });
}
