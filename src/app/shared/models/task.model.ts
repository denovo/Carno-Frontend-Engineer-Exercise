import { Priority } from "./priority.enum";

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority: Priority;
  assignee?: string;
  /** Creation timestamp. Used with OVERDUE_THRESHOLD_DAYS for age-based overdue detection. */
  createdAt: Date;
  updatedAt: Date;
}
