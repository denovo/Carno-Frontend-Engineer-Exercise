import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { createFeature, createReducer, on } from "@ngrx/store";
import { Task } from "@app/shared/models";
import * as TaskActions from "../actions/task.actions";

export interface TaskState extends EntityState<Task> {
  loading: boolean;
  error: string | null;
}

export const taskAdapter: EntityAdapter<Task> = createEntityAdapter<Task>({
  selectId: (task: Task) => task.id,
  sortComparer: (a: Task, b: Task) => a.order - b.order,
});

export const initialState: TaskState = taskAdapter.getInitialState({
  loading: false,
  error: null,
});

export const tasksFeature = createFeature({
  name: "tasks",
  reducer: createReducer(
    initialState,

    on(TaskActions.loadTasks, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

    on(TaskActions.loadTasksSuccess, (state, { tasks }) =>
      taskAdapter.setAll(tasks, { ...state, loading: false })
    ),

    on(TaskActions.loadTasksFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    on(TaskActions.addTaskSuccess, (state, { task }) =>
      taskAdapter.addOne(task, state)
    ),

    on(TaskActions.addTaskFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    // Optimistic update: apply immediately before API response (NGR-09)
    on(TaskActions.moveTask, (state, { taskId, newColumnId }) =>
      taskAdapter.updateOne(
        { id: taskId, changes: { columnId: newColumnId } },
        state
      )
    ),

    on(TaskActions.moveTaskSuccess, (state) => state),

    // Rollback: revert to previousColumnId on API failure (NGR-10)
    on(TaskActions.moveTaskFailure, (state, { taskId, previousColumnId }) =>
      taskAdapter.updateOne(
        { id: taskId, changes: { columnId: previousColumnId } },
        state
      )
    ),

    on(TaskActions.updateTaskSuccess, (state, { update }) =>
      taskAdapter.updateOne(update, state)
    ),

    on(TaskActions.updateTaskFailure, (state, { error }) => ({
      ...state,
      error,
    })),

    on(TaskActions.reorderTask, (state, { columnId, fromIndex, toIndex }) => {
      if (fromIndex === toIndex) return state;
      const columnTasks = taskAdapter
        .getSelectors()
        .selectAll(state)
        .filter((t) => t.columnId === columnId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= columnTasks.length || toIndex >= columnTasks.length) {
        return state;
      }
      const reordered = [...columnTasks];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return taskAdapter.updateMany(
        reordered.map((task, index) => ({ id: task.id, changes: { order: index } })),
        state
      );
    }),

    on(TaskActions.removeTaskSuccess, (state, { taskId }) =>
      taskAdapter.removeOne(taskId, state)
    ),

    on(TaskActions.removeTaskFailure, (state, { error }) => ({
      ...state,
      error,
    }))
  ),
});

export const {
  name: tasksFeatureKey,
  reducer: tasksReducer,
  selectTasksState,
  selectLoading,
  selectError,
} = tasksFeature;
