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

for (const width of [1280, 390]) {
  test(`clearing a full row preserves every row's height at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    await page.route("https://fonts.googleapis.com/**", (route) =>
      route.abort(),
    );
    await page.goto("/");
    await page.getByRole("button", { name: "Start", exact: true }).click();
    const rows = () =>
      page.locator(".cell").evaluateAll((cells) =>
        cells
          .filter((_, index) => index % 10 === 0)
          .map((cell) => {
            const box = cell.getBoundingClientRect();
            return { height: box.height, top: box.top };
          }),
      );
    const before = await rows();
    // A fixed random source produces horizontally paired tiles in the first row.
    for (let index = 0; index < 10; index++) {
      await page.locator(`[data-index="${index}"]`).click();
    }
    await expect(page.locator(".tile")).toHaveCount(70);
    const after = await rows();
    for (let row = 0; row < 8; row++) {
      expect(Math.abs(after[row].height - before[row].height)).toBeLessThan(
        0.5,
      );
      expect(Math.abs(after[row].top - before[row].top)).toBeLessThan(0.5);
    }
  });
}
