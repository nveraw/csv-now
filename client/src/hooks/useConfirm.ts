import type { UploadOption } from "@/types/upload";
import { useMutation } from "@tanstack/react-query";

export function useConfirm() {
  return useMutation({
    mutationFn: async ({
      uploadId,
      option,
    }: {
      uploadId: string;
      option: UploadOption;
    }) => {
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
