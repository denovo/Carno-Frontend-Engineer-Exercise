import { test, expect } from "@playwright/test";

test("failed move reverts task to original column (rollback)", async ({
  page,
}) => {
  // ?failNextMove=1 → BoardPageComponent.ngOnInit sets TaskMockService.shouldFail = true
  await page.goto("/?failNextMove=1");

  // Wait for board to load with seed tasks
  const todoColumn = page.getByTestId("column-col-todo");
  await expect(todoColumn).toBeVisible();

  // task-1 "Design login screen" is seeded in col-todo (from MOCK_TASKS)
  await expect(todoColumn.getByText("Design login screen")).toBeVisible();

  // Expand the task card to reveal the move select
  const taskCard = page.getByTestId("task-card-task-1");
  await taskCard.getByRole("button", { name: /expand/i }).click();

  // Move via select — this will fail server-side and trigger rollback
  const moveSelect = page.getByTestId("move-select-task-1");
  await moveSelect.click();
  await page.getByRole("option", { name: /in progress/i }).click();

  // After rollback delay (latencyMs ≈ 400ms), task must be back in col-todo
  await expect(todoColumn.getByText("Design login screen")).toBeVisible({
    timeout: 5_000,
  });

  // Snackbar error should appear (board-page dispatches snackBar.open on moveTaskFailure)
  await expect(page.getByText(/failed to move/i)).toBeVisible({ timeout: 5_000 });
});
