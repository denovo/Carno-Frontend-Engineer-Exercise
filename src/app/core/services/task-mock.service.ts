import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { delay } from "rxjs/operators";
import type { Task } from "@app/shared/models";
import type { Update } from "@ngrx/entity";
import { MOCK_TASKS } from "./mock-data";

@Injectable({ providedIn: "root" })
export class TaskMockService {
  /** Simulated network latency in ms. Set to 0 in tests for synchronous execution. */
  latencyMs = 400;

  /** When true, all methods return an error Observable to simulate network failure. */
  shouldFail = false;

  loadTasks(_boardId: string): Observable<Task[]> {
    if (this.shouldFail) {
      return throwError(() => new Error("loadTasks failed")).pipe(
        delay(this.latencyMs)
      );
    }
    return of([...MOCK_TASKS]).pipe(delay(this.latencyMs));
  }

  moveTask(_taskId: string, _newColumnId: string): Observable<void> {
    if (this.shouldFail) {
      return throwError(() => new Error("moveTask failed")).pipe(
        delay(this.latencyMs)
      );
    }
    return of(undefined as void).pipe(delay(this.latencyMs));
  }

  addTask(task: Omit<Task, "id" | "order" | "createdAt" | "updatedAt">): Observable<Task> {
    if (this.shouldFail) {
      return throwError(() => new Error("addTask failed")).pipe(
        delay(this.latencyMs)
      );
    }
    const now = new Date();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      order: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    return of(newTask).pipe(delay(this.latencyMs));
  }

  updateTask(_update: Update<Task>): Observable<void> {
    if (this.shouldFail) {
      return throwError(() => new Error("updateTask failed")).pipe(
        delay(this.latencyMs)
      );
    }
    return of(undefined as void).pipe(delay(this.latencyMs));
  }

  removeTask(_taskId: string): Observable<void> {
    if (this.shouldFail) {
      return throwError(() => new Error("removeTask failed")).pipe(
        delay(this.latencyMs)
      );
    }
    return of(undefined as void).pipe(delay(this.latencyMs));
  }
}
