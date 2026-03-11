import { createSelector } from "@ngrx/store";
import { Priority } from "@app/shared/models";
import { taskAdapter, selectTasksState } from "../reducers/task.reducer";

// Entity adapter base selectors
const { selectAll: selectAllTasks } = taskAdapter.getSelectors(selectTasksState);
export { selectAllTasks };

// NGR-06: Factory selector — creates one memoized selector per columnId call
export const selectTasksByColumn = (columnId: string) =>
  createSelector(selectAllTasks, (tasks) =>
    tasks.filter((task) => task.columnId === columnId)
  );

// NGR-07: Priority count breakdown
export const selectCountByPriority = createSelector(selectAllTasks, (tasks) => {
  const counts: Record<Priority, number> = {
    [Priority.Low]: 0,
    [Priority.Medium]: 0,
    [Priority.High]: 0,
    [Priority.Critical]: 0,
  };
  for (const task of tasks) {
    counts[task.priority]++;
  }
  return counts;
});

// NGR-08: Completion rate — factory selector taking doneColumnId parameter
// Use with DONE_COLUMN_ID constant from @app/core/constants
export const selectCompletionRate = (doneColumnId: string) =>
  createSelector(selectAllTasks, (tasks) => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.columnId === doneColumnId).length;
    return Math.round((done / tasks.length) * 100);
  });
