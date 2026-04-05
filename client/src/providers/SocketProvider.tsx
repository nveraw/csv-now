import { getSocket } from "@/libs/socket";
import {
  appendRows,
  upload,
  uploadComplete,
  uploadError,
} from "@/store/uploadSlice";
import type { Data } from "@/types/display";
import type { Progress } from "@/types/upload";
import { type ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { connect, disconnect, reconnectFail } from "../store/socketSlice";

export function SocketProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => dispatch(connect(socket.id!));
    const onDisconnect = () => dispatch(disconnect());
    const onReconnectFail = () => {
      dispatch(reconnectFail());
    };
    const onUpload = (payload: Progress) => dispatch(upload(payload));
    const onUploadComplete = (payload: Progress) =>
      dispatch(uploadComplete(payload));
    const onUploadError = ({ message }: { message: string }) =>
      dispatch(uploadError(message));
    const onError = (e: Error) => console.log("generic socket error", e);
    const onNewRows = ({ rows }: { rows: Data[] }) =>
      dispatch(appendRows(rows));

    socket.on("new_rows", onNewRows);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_failed", onReconnectFail);
    socket.on("upload_progress", onUpload);
    socket.on("upload_complete", onUploadComplete);
    socket.on("upload_error", onUploadError);
    socket.io.on("error", onError);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_failed", onReconnectFail);
      socket.off("upload_progress", onUpload);
      socket.off("upload_complete", onUploadComplete);
      socket.off("upload_error", onUploadError);
      socket.io.off("error", onError);
      socket.off("new_rows", onNewRows);
    };
  }, [dispatch]);

  return children;
}
