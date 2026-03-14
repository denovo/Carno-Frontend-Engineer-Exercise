import { createFeature, createReducer, on } from "@ngrx/store";
import { Column } from "@app/shared/models";
import { BoardActions } from "../actions/board.actions";
import { MOCK_BOARD } from "@app/core/services/mock-data";

export interface BoardState {
  id: string;
  name: string;
  columns: Column[];
}

const initialState: BoardState = {
  id: MOCK_BOARD.id,
  name: MOCK_BOARD.name,
  columns: [...MOCK_BOARD.columns],
};

export const boardFeature = createFeature({
  name: "board",
  reducer: createReducer(
    initialState,
    on(BoardActions.updateBoardName, (state, { name }) => ({ ...state, name })),
    on(BoardActions.addColumn, (state, { column }) => ({
      ...state,
      columns: [...state.columns, column],
    })),
    on(BoardActions.renameColumn, (state, { id, name }) => ({
      ...state,
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, name } : col
      ),
    })),
    on(BoardActions.removeColumn, (state, { id }) => ({
      ...state,
      columns: state.columns.filter((col) => col.id !== id),
    }))
  ),
});

export const {
  name: boardFeatureKey,
  reducer: boardReducer,
  selectBoardState,
  selectName: selectBoardName,
  selectColumns,
} = boardFeature;
