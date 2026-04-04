import type { Progress, UploadState } from "@/types/upload";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: UploadState = {
  id: null,
  progress: null,
  uploadError: null,
  isDone: false,
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
    },
    uploadComplete: (state, action: PayloadAction<Progress>) => {
      state.progress = action.payload;
      state.isDone = true;
    },
    reset: () => initialState,
  },
});

export const { setUploadId, upload, uploadError, uploadComplete, reset } =
  uploadSlice.actions;
