import type { StoreState } from "@/store";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export function useUploadCsv() {
  const socketId = useSelector((state: StoreState) => state.socket.socketId);

  return useMutation({
    mutationFn: async (file: File) => {
      if (!socketId) {
        throw new Error("Socket not connected");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("socketId", socketId);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
