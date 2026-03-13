import type { Meta, StoryObj } from "@storybook/angular";
import { ProgressWidgetComponent } from "./progress-widget.component";
import type { WidgetStatus } from "@app/core/models/widget.models";

const meta: Meta<ProgressWidgetComponent> = {
  component: ProgressWidgetComponent,
  title: "Board/ProgressWidget",
};
export default meta;

type Story = StoryObj<ProgressWidgetComponent>;

// Story 1: 0% — no tasks done
export const ZeroPercent: Story = {
  args: {
    status: { value: 0, status: "neutral" } as WidgetStatus<number>,
  },
};

// Story 2: 62% — partial completion
export const PartialProgress: Story = {
  args: {
    status: { value: 62, status: "success" } as WidgetStatus<number>,
  },
};

// Story 3: 100% — all tasks done
export const Complete: Story = {
  args: {
    status: { value: 100, status: "success" } as WidgetStatus<number>,
  },
};
