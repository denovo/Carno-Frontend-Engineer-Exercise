import { Action, ActionReducer } from "@ngrx/store";
import { Task } from "@app/shared/models";
import { tasksFeatureKey } from "./task.reducer";

const STORAGE_KEY = "petello-state";

interface PersistedState {
  [tasksFeatureKey]: {
    entities: Record<string, Task>;
    ids: string[];
    loading: boolean;
    error: string | null;
  };
}

function reviveDates(entities: Record<string, Task>): Record<string, Task> {
  return Object.fromEntries(
    Object.entries(entities).map(([id, task]) => [
      id,
      {
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      },
    ])
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function localStorageMetaReducer<T, V extends Action = Action>(
  reducer: ActionReducer<T, V>
): ActionReducer<T, V> {
  return (state: T | undefined, action: V): T => {
    if (state === undefined) {
      try {
        const persisted = localStorage.getItem(STORAGE_KEY);
        if (persisted) {
          const parsed = JSON.parse(persisted) as PersistedState;
          if (parsed?.[tasksFeatureKey]?.entities) {
            parsed[tasksFeatureKey].entities = reviveDates(
              parsed[tasksFeatureKey].entities
            );
          }
          state = parsed as unknown as T;
        }
      } catch {
        // Corrupt or unavailable storage — fall through to default initial state
      }
    }

    const nextState = reducer(state, action);

    // Persist after user-driven actions; skip NGRX internal init actions
    if (
      action.type !== "@ngrx/store/init" &&
      action.type !== "@ngrx/store/update-reducers"
    ) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        // Storage quota exceeded or unavailable — continue without persistence
      }
    }

    return nextState;
  };
}
