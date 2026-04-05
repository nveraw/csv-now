import type { Data } from "@/types/display";
import type { Progress, UploadState } from "@/types/upload";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: UploadState = {
  id: null,
  progress: null,
  uploadError: null,
  isDone: false,
  newRows: [],
};

export const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    setUploadId: (state, action: PayloadAction<string>) => {
      // Single upload at a time
      state.id = action.payload;
      state.progress = null;
      state.uploadError = null;
      state.isDone = false;
    },
    upload: (state, action: PayloadAction<Progress>) => {
      state.progress = action.payload;
    },
    uploadError: (state, action: PayloadAction<string>) => {
      state.uploadError = action.payload;
      state.id = null;
    },
    uploadComplete: (state, action: PayloadAction<Progress>) => {
      state.progress = action.payload;
      state.id = null;
      state.isDone = true;
    },
    appendRows: (state, action: PayloadAction<Data[]>) => {
      const incomingIds = new Set(action.payload.map((r) => r.id));
      state.newRows = [
        ...action.payload,
        ...state.newRows.filter((r) => !incomingIds.has(r.id)),
      ];
    },
    reset: () => initialState,
  },
});

export const {
  setUploadId,
  upload,
  uploadError,
  appendRows,
  uploadComplete,
  reset,
} = uploadSlice.actions;
