import { configureStore } from "@reduxjs/toolkit";
import { socketSlice } from "./socketSlice";
import { uploadSlice } from "./uploadSlice";

const store = configureStore({
  reducer: {
    socket: socketSlice.reducer,
    upload: uploadSlice.reducer,
  },
});
export type StoreState = ReturnType<typeof store.getState>;
export default store;
