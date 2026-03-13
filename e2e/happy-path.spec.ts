import { test, expect } from "@playwright/test";

test("create task and move to In Progress column", async ({ page }) => {
  await page.goto("/");

  // Wait for the board to load (tasks are seeded, columns appear)
  await expect(page.getByTestId("column-col-todo")).toBeVisible();

  // Open global Add Task dialog
  await page.getByTestId("add-task-btn").click();

  // Fill the task form dialog
  // The form has mat-form-fields with labels — use getByLabel for inputs
  await page.getByLabel(/title/i).fill("E2E Test Task");
  // Priority mat-select — click to open, then select option
  await page.getByLabel(/priority/i).click();
  await page.getByRole("option", { name: /high/i }).click();
  // Assignee (optional) — skip
  // Submit the form
  await page.getByRole("button", { name: /add task|save/i }).click();

  // Verify task card appears in the Todo column
  const todoColumn = page.getByTestId("column-col-todo");
  await expect(todoColumn.getByText("E2E Test Task")).toBeVisible();

  // Move the task: expand a task card, then change the move-select
  // The new task will be the last in col-todo; find by its title first
  const taskCard = todoColumn.locator("[data-testid^='task-card-']").filter({
    hasText: "E2E Test Task",
  });

  // Expand the card to reveal the move select
  await taskCard.getByRole("button", { name: /expand/i }).click();

  // Get the move-select within this card (data-testid="move-select-{id}")
  const moveSelect = taskCard.locator("[data-testid^='move-select-']");

  // Angular Material mat-select uses a custom overlay — click to open options
  await moveSelect.click();
  // Select "In Progress" option from the overlay panel
  await page.getByRole("option", { name: /in progress/i }).click();

  // Wait for the optimistic update — task should move to in-progress column
  const inProgressColumn = page.getByTestId("column-col-in-progress");
  await expect(inProgressColumn.getByText("E2E Test Task")).toBeVisible();

  // Task must NOT appear in todo column anymore
  await expect(todoColumn.getByText("E2E Test Task")).not.toBeVisible();
});
