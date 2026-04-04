import type { StoreState } from "@/store";
import type { UploadOption } from "@/types/upload";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export function useConfirm() {
  const uploadId = useSelector((state: StoreState) => state.upload.id);

  return useMutation({
    mutationFn: async (option: UploadOption) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/${uploadId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ option }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
