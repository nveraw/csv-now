import type { TableResponse, UseTableParams } from "@/types/display";
import { useQuery } from "@tanstack/react-query";

export function useTable({ page, pageSize = 10, filter = "" }: UseTableParams) {
  return useQuery<TableResponse>({
    queryKey: ["display", page, pageSize, filter],
    queryFn: async () => {
      const sanitizedFilter = filter.trim();
      if (sanitizedFilter.length > 100) {
        throw new Error("Filter too long");
      }
      if (!/^[a-zA-Z0-9\s]*$/.test(sanitizedFilter)) {
        throw new Error("Invalid filter characters");
      }

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        filter: sanitizedFilter,
      });
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/records?${params}`,
      );
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    },
    placeholderData: (prev) => prev,
    retry: false,
    staleTime: Infinity,
  });
}
