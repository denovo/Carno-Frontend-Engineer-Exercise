export interface Column {
  id: string;
  name: string;
  /** Display order within the board. Lower values appear first. */
  order: number;
}
