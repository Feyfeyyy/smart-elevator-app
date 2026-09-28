const { test, expect } = require("@playwright/test");

async function configureCar(page, { id, floors, currentFloor = "0" }) {
  await page.getByRole("button", { name: "Service setup" }).click();
  await page.getByRole("button", { name: "Add car" }).click();
  await page.getByRole("textbox", { name: "Car id" }).fill(id);
  await page.getByRole("spinbutton", { name: "Current floor" }).fill(currentFloor);
  await page.getByRole("textbox", { name: /Floors served/ }).fill(floors);
  await page.getByRole("button", { name: "Save cars" }).click();
  await expect(page.getByRole("button", { name: "Call" })).toBeVisible();
}

test("shows an empty bank until a car is configured", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Smart Elevator")).toBeVisible();
  await expect(page.getByText("This bank has no cars yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "Service setup" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Call" })).toHaveCount(0);
});

test("adds floor buttons after a car is saved", async ({ page }) => {
  await page.goto("/");
  await configureCar(page, { id: "A", floors: "0, 1, 2" });

  await expect(page.getByText("Car A")).toBeVisible();
  await expect(page.getByRole("button", { name: "2", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "1", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "0", exact: true })).toBeVisible();
});

test("shows each floor the car passes after a call", async ({ page }) => {
  await page.goto("/");
  await configureCar(page, { id: "A", floors: "0, 1, 2, 3", currentFloor: "0" });

  await page.getByRole("button", { name: "3", exact: true }).click();
  await page.getByRole("button", { name: "Call" }).click();

  await expect(page.getByText("Proceed to car A")).toBeVisible();
  await expect(page.getByText(/Passing 0[123]/).first()).toBeVisible();
  await expect(page.locator(".text-5xl")).toHaveText("03");
});
