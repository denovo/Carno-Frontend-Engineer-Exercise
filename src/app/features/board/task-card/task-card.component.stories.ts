import type { Meta, StoryObj } from "@storybook/angular";
import { userEvent, within } from "@storybook/test";
import { TaskCardComponent } from "./task-card.component";
import { Priority } from "@app/shared/models";
import { MOCK_COLUMNS } from "@app/core/services/mock-data";

const meta: Meta<TaskCardComponent> = {
  component: TaskCardComponent,
  title: "Board/TaskCard",
  // No module-level decorators needed — provideAnimationsAsync() is in preview.ts
};
export default meta;

type Story = StoryObj<TaskCardComponent>;

// Base task fixture — Medium priority, recent date (not overdue)
const baseTask = {
  id: "story-task-1",
  title: "Design login screen",
  description: "Create wireframes and prototype for the new login flow",
  columnId: "col-todo",
  priority: Priority.Medium,
  assignee: "alice",
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Story 1: Default — collapsed card, Medium priority (SIG-01, SIG-02)
export const Default: Story = {
  args: {
    task: baseTask,
    columns: MOCK_COLUMNS,
    isExpanded: false,
  },
};

// Story 2: Expanded — body visible, move select and action buttons shown (SIG-05)
export const Expanded: Story = {
  args: {
    task: baseTask,
    columns: MOCK_COLUMNS,
    isExpanded: true,
  },
};

// Story 3: Overdue — Critical priority, createdAt far in the past (SIG-02, SIG-04)
// createdAt older than OVERDUE_THRESHOLD_DAYS (7 days) triggers overdue computed signal
export const Overdue: Story = {
  args: {
    task: {
      ...baseTask,
      priority: Priority.Critical,
      createdAt: new Date("2025-01-01"), // > 7 days old
      updatedAt: new Date("2025-01-01"),
    },
    columns: MOCK_COLUMNS,
    isExpanded: false,
  },
};

// Story 4: Edit Mode — expanded card with Edit mode active (SIG-05, SIG-06)
// isEditMode is signal() (not input()), so args cannot set it directly.
// play() expands the card (isExpanded is already true via args) then clicks Edit button.
export const EditMode: Story = {
  args: {
    task: baseTask,
    columns: MOCK_COLUMNS,
    isExpanded: true, // model() — set via args to show expanded state
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Click the Edit button to trigger enterEditMode() → isEditMode.set(true)
    const editButton = canvas.getByRole("button", { name: /edit task/i });
    await userEvent.click(editButton);
    // After click, "Edit form opens via dialog" text appears in card content
  },
};
