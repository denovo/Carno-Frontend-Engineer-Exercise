import { describe, it, expect } from "vitest";
import { tasksFeature, initialState, taskAdapter } from "./task.reducer";
import * as TaskActions from "../actions/task.actions";
import { Priority, Task } from "@app/shared/models";
import { createAction } from "@ngrx/store";

const { reducer } = tasksFeature;

const mockTask: Task = {
  id: "task-1",
  title: "Test Task",
  columnId: "col-todo",
  priority: Priority.Medium,
  order: 0,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("tasksReducer", () => {
  it("should return initial state for unknown action", () => {
    const unknownAction = createAction("UNKNOWN")();
    const state = reducer(undefined, unknownAction);
    expect(state).toEqual(initialState);
  });

  it("loadTasks should set loading to true", () => {
    const action = TaskActions.loadTasks({ boardId: "board-1" });
    const state = reducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("loadTasksSuccess should replace all tasks and clear loading", () => {
    const loadingState = reducer(
      initialState,
      TaskActions.loadTasks({ boardId: "board-1" })
    );
    const action = TaskActions.loadTasksSuccess({ tasks: [mockTask] });
    const state = reducer(loadingState, action);
    expect(state.loading).toBe(false);
    const allTasks = taskAdapter.getSelectors().selectAll(state);
    expect(allTasks).toHaveLength(1);
    expect(allTasks[0].id).toBe("task-1");
  });

  it("loadTasksFailure should set error message and clear loading", () => {
    const loadingState = reducer(
      initialState,
      TaskActions.loadTasks({ boardId: "board-1" })
    );
    const action = TaskActions.loadTasksFailure({ error: "Server error" });
    const state = reducer(loadingState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Server error");
  });

  it("addTaskSuccess should add task to state", () => {
    const action = TaskActions.addTaskSuccess({ task: mockTask });
    const state = reducer(initialState, action);
    const allTasks = taskAdapter.getSelectors().selectAll(state);
    expect(allTasks).toHaveLength(1);
    expect(allTasks[0].id).toBe("task-1");
  });

  it("moveTask should update columnId immediately (optimistic)", () => {
    const stateWithTask = taskAdapter.addOne(mockTask, initialState);
    const action = TaskActions.moveTask({
      taskId: "task-1",
      previousColumnId: "col-todo",
      newColumnId: "col-in-progress",
    });
    const state = reducer(stateWithTask, action);
    expect(state.entities["task-1"]?.columnId).toBe("col-in-progress");
  });

  it("moveTaskFailure should revert columnId to previousColumnId (rollback)", () => {
    const stateWithTask = taskAdapter.addOne(mockTask, initialState);
    // First apply optimistic move
    const optimisticState = reducer(
      stateWithTask,
      TaskActions.moveTask({
        taskId: "task-1",
        previousColumnId: "col-todo",
        newColumnId: "col-in-progress",
      })
    );
    expect(optimisticState.entities["task-1"]?.columnId).toBe(
      "col-in-progress"
    );
    // Then apply rollback
    const rollbackAction = TaskActions.moveTaskFailure({
      taskId: "task-1",
      previousColumnId: "col-todo",
      error: "Network error",
    });
    const state = reducer(optimisticState, rollbackAction);
    expect(state.entities["task-1"]?.columnId).toBe("col-todo");
  });

  it("updateTaskSuccess should patch task title", () => {
    const stateWithTask = taskAdapter.addOne(mockTask, initialState);
    const action = TaskActions.updateTaskSuccess({
      update: { id: "task-1", changes: { title: "Updated Title" } },
    });
    const state = reducer(stateWithTask, action);
    expect(state.entities["task-1"]?.title).toBe("Updated Title");
    // columnId unchanged
    expect(state.entities["task-1"]?.columnId).toBe("col-todo");
  });

  describe("reorderTask", () => {
    const makeTaskInCol = (id: string, order: number): Task => ({
      ...mockTask, id, order,
    });

    it("reorders tasks within the column", () => {
      const t0 = makeTaskInCol("t0", 0);
      const t1 = makeTaskInCol("t1", 1);
      const t2 = makeTaskInCol("t2", 2);
      const state = taskAdapter.addMany([t0, t1, t2], initialState);
      const next = reducer(state, TaskActions.reorderTask({ columnId: "col-todo", fromIndex: 0, toIndex: 2 }));
      const all = taskAdapter.getSelectors().selectAll(next);
      expect(all.map((t) => t.id)).toEqual(["t1", "t2", "t0"]);
    });

    it("is a no-op when fromIndex === toIndex", () => {
      const state = taskAdapter.addOne(mockTask, initialState);
      const next = reducer(state, TaskActions.reorderTask({ columnId: "col-todo", fromIndex: 0, toIndex: 0 }));
      expect(next).toBe(state);
    });

    it("is a no-op when index is out of bounds", () => {
      const state = taskAdapter.addOne(mockTask, initialState);
      const next = reducer(state, TaskActions.reorderTask({ columnId: "col-todo", fromIndex: 0, toIndex: 5 }));
      expect(next).toBe(state);
    });
  });

  it("removeTaskSuccess should remove task from state", () => {
    const stateWithTask = taskAdapter.addOne(mockTask, initialState);
    const action = TaskActions.removeTaskSuccess({ taskId: "task-1" });
    const state = reducer(stateWithTask, action);
    const allTasks = taskAdapter.getSelectors().selectAll(state);
    expect(allTasks).toHaveLength(0);
    expect(state.entities["task-1"]).toBeUndefined();
  });
});
