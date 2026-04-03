import { useTable } from "@/hooks/useTable";
import { Stack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Loading from "../Loading/Loading";
import { Toaster, toaster } from "../ui/toaster";
import CsvPagination from "./components/CsvPagination";
import CsvTable from "./components/CsvTable";

const ROWS_PER_PAGE = 5;

export default function CsvDisplay({ filter }: { filter?: string }) {
  const [page, setPage] = useState(1);
  const {
    data: response,
    error,
    isFetching,
  } = useTable({
    page,
    pageSize: ROWS_PER_PAGE,
    filter,
  });
  const { data, total } = response || {};
  const toastRef = useRef<string>(null);

  useEffect(() => {
    const visible = toastRef.current
      ? toaster.isVisible(toastRef.current || "")
      : false;
    if (visible || !error) {
      return;
    }

    toastRef.current = toaster.create({
      description: error.message,
      type: "error",
      closable: true,
    });
  }, [error]);

  return (
    <Stack width="full" gap="5">
      {isFetching && <Loading label="Fetching data..." />}
      {error && <Toaster />}
      {data && (
        <>
          <CsvTable
            data={[...data].splice(
              ROWS_PER_PAGE * (page - 1),
              ROWS_PER_PAGE * page,
            )}
          />
          <CsvPagination
            count={total || data.length}
            page={page}
            onPageChange={setPage}
            disabled={isFetching}
          />
        </>
      )}
    </Stack>
  );
}
