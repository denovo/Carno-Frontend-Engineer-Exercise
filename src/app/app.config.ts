import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { provideStoreDevtools } from "@ngrx/store-devtools";

import { routes } from "./app.routes";
import { tasksReducer, tasksFeatureKey } from "@app/core/store/reducers/task.reducer";
import { localStorageMetaReducer } from "@app/core/store/reducers/local-storage.meta-reducer";
import { TaskEffects } from "@app/core/store/effects/task.effects";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideStore({ [tasksFeatureKey]: tasksReducer }, { metaReducers: [localStorageMetaReducer] }),
    provideEffects([TaskEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
    }),
  ],
};
