import { createSlice } from "@reduxjs/toolkit";

export const socketSlice = createSlice({
  name: "socket",
  initialState: {
    isConnected: false,
    socketId: null,
    reconnectFailed: false,
  },
  reducers: {
    connect: (state, action) => {
      state.isConnected = true;
      state.socketId = action.payload;
    },
    disconnect: (state) => {
      state.isConnected = false;
      state.socketId = null;
    },
    reconnectFail: (state) => {
      state.reconnectFailed = true;
    },
  },
});

export const { connect, disconnect, reconnectFail } = socketSlice.actions;
