import { expect, test } from "@playwright/test";

test("start reveals the board, a central match animates, and a new board resets play", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".tile")).toHaveCount(0);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".tile")).toHaveCount(80);
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.locator('[data-index="34"]').click();
  await page.locator('[data-index="35"]').click();
  await expect(page.locator(".connection")).toHaveCount(1);
  await expect(page.locator(".tile")).toHaveCount(78);
  await page.getByRole("button", { name: "New board", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".tile")).toHaveCount(0);
});

test("a short configurable countdown ends play and offers a new board", async ({
  page,
}) => {
  await page.goto("/?seconds=1");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Time’s up" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "New board", exact: true }),
  ).toBeVisible();
});

test("the board fits a narrow touchscreen and accepts taps", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Start", exact: true }).tap();
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  const box = await page.locator(".board").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.locator('[data-index="34"]').tap();
  await page.locator('[data-index="35"]').tap();
  await expect(page.locator(".tile")).toHaveCount(78);
});
