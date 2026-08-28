import { expect } from '@playwright/test';
import { recipeContracts } from '../../dist/system/contract.js';

export const compactMonitor = recipeContracts['compact-monitor'];
export const fixturePath = '/spec/system/compact-monitor.html';

export function fixtureUrl(options = {}) {
  const parameters = new URLSearchParams();
  for (const [name, value] of Object.entries(options)) {
    if (value !== undefined && value !== null) parameters.set(name, value);
  }
  const query = parameters.toString();
  return query ? `${fixturePath}?${query}` : fixturePath;
}

export async function openProof(page, options = {}) {
  const response = await page.goto(fixtureUrl(options));
  expect(response?.ok(), `fixture HTTP status for ${fixtureUrl(options)}`).toBe(true);
  const documentRoot = page.locator('html');
  await expect(documentRoot).toHaveAttribute('data-proof-ready', 'true');
  await expect(documentRoot).not.toHaveAttribute('data-proof-error', /.+/);
  const root = page.locator('[data-proof-root]');
  await expect(root).toBeVisible();
  return root;
}

export async function expectNoInlineOverflow(page, root) {
  const report = await page.evaluate(() => {
    const recipe = document.querySelector('[data-proof-root]');
    return {
      documentClient: document.documentElement.clientWidth,
      documentScroll: document.documentElement.scrollWidth,
      recipeClient: recipe.clientWidth,
      recipeScroll: recipe.scrollWidth,
    };
  });
  expect(report.documentScroll).toBeLessThanOrEqual(report.documentClient + 1);
  expect(report.recipeScroll).toBeLessThanOrEqual(report.recipeClient + 1);
  await expect(root).toBeVisible();
}

export async function contentInlineSize(root) {
  return root.evaluate((element) => {
    const style = getComputedStyle(element);
    return (
      element.getBoundingClientRect().width -
      Number.parseFloat(style.paddingInlineStart) -
      Number.parseFloat(style.paddingInlineEnd) -
      Number.parseFloat(style.borderInlineStartWidth) -
      Number.parseFloat(style.borderInlineEndWidth)
    );
  });
}

export async function expectedCssLength(page, value) {
  return page.evaluate((length) => {
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;inline-size:${length}`;
    document.body.append(probe);
    const pixels = probe.getBoundingClientRect().width;
    probe.remove();
    return pixels;
  }, value);
}

export function axeFailureMessage(violations) {
  return violations
    .map(
      (violation) =>
        `${violation.id}: ${violation.help}\n${violation.nodes
          .map((node) => `  ${node.target.join(' ')} — ${node.failureSummary}`)
          .join('\n')}`,
    )
    .join('\n');
}
