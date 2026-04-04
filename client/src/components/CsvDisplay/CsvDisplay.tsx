import { useTable } from "@/hooks/useTable";
import { Stack } from "@chakra-ui/react";
import { useState } from "react";
import CsvError from "../CsvError/CsvError";
import Loading from "../Loading/Loading";
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

  return (
    <Stack width="full" gap="5">
      {isFetching && <Loading label="Fetching data..." />}
      <CsvError error={error} />
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
