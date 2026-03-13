import type { Meta, StoryObj } from "@storybook/angular";
import { TaskCountWidgetComponent } from "./task-count-widget.component";
import type { WidgetStatus } from "@app/core/models/widget.models";

const meta: Meta<TaskCountWidgetComponent> = {
  component: TaskCountWidgetComponent,
  title: "Board/TaskCountWidget",
};
export default meta;

type Story = StoryObj<TaskCountWidgetComponent>;

// Story 1: Neutral — ≤10 tasks (green/neutral status)
export const Neutral: Story = {
  args: {
    status: { value: 5, status: "neutral" } as WidgetStatus<number>,
  },
};

// Story 2: Warning — 11–20 tasks
export const Warning: Story = {
  args: {
    status: { value: 15, status: "warning" } as WidgetStatus<number>,
  },
};

// Story 3: Error — >20 tasks
export const Error: Story = {
  args: {
    status: { value: 25, status: "error" } as WidgetStatus<number>,
  },
};
