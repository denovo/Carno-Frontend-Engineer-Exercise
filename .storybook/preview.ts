// .storybook/preview.ts
import type { Preview } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [provideAnimationsAsync()],
    }),
  ],
  parameters: {
    a11y: {
      element: "#storybook-root",
    },
  },
};

export default preview;
