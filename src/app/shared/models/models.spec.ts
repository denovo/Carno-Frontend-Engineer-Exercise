import { describe, it, expect } from "vitest";
import { Priority } from "./priority.enum";

describe("Priority enum", () => {
  it("should define exactly four priority levels", () => {
    const values = Object.values(Priority);
    expect(values).toHaveLength(4);
  });

  it("should map to uppercase string values", () => {
    expect(Priority.Low).toBe("LOW");
    expect(Priority.Medium).toBe("MEDIUM");
    expect(Priority.High).toBe("HIGH");
    expect(Priority.Critical).toBe("CRITICAL");
  });
});
