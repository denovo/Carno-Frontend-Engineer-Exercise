import { createActionGroup, props } from "@ngrx/store";
import { Column, Board } from "@app/shared/models";

export const BoardActions = createActionGroup({
  source: "Board",
  events: {
    "Update Board Name": props<{ name: string }>(),
    "Add Column": props<{ column: Column }>(),
    "Rename Column": props<{ id: string; name: string }>(),
    "Remove Column": props<{ id: string }>(),
  },
});
