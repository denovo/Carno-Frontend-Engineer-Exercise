// Actions
export * from "./actions/task.actions";

// Reducer — state shape, adapter, and feature selectors
export * from "./reducers/task.reducer";

// Derived selectors
export * from "./selectors/task.selectors";

// Effects (exported for provideEffects in app.config.ts and potential testing)
export { TaskEffects } from "./effects/task.effects";
