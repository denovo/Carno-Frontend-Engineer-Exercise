// .storybook/preview.ts
import type { Preview } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

const preview: Preview = {
  globalTypes: {
    colorScheme: {
      description: "Color scheme",
      toolbar: {
        title: "Color scheme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorScheme: "light",
  },
  decorators: [
    applicationConfig({
      providers: [provideAnimationsAsync()],
    }),
    (_storyFn, context) => {
      const scheme = (context.globals["colorScheme"] as string) ?? "light";
      document.body.style.colorScheme = scheme;
      document.body.style.backgroundColor = "var(--mat-sys-surface)";
      document.body.style.color = "var(--mat-sys-on-surface)";
      return _storyFn();
    },
  ],
  parameters: {
    a11y: {},
    backgrounds: { disable: true },
  },
};

export default preview;
