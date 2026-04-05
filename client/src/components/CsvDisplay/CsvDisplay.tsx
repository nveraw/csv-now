import { useRecord } from "@/hooks/useRecord";
import type { StoreState } from "@/store";
import { Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ErrorToast from "../ErrorToast/ErrorToast";
import CsvPagination from "./components/CsvPagination";
import CsvTable from "./components/CsvTable";
import NoData from "./components/NoData";

const ROWS_PER_PAGE = 5;

export default function CsvDisplay({ filter }: { filter?: string }) {
  const [page, setPage] = useState(1);
  const {
    data: response,
    error,
    isFetching,
    refetch,
  } = useRecord({
    page,
    pageSize: ROWS_PER_PAGE,
    filter,
  });
  const { data, total = 0 } = response || {};

  const dispatch = useDispatch();
  const newRows = useSelector((state: StoreState) => state.upload.newRows);
  const isDone = useSelector((state: StoreState) => state.upload.isDone);
  const displayData = (data || []).concat(newRows);

  useEffect(() => {
    if (isDone) {
      // refetch();
      // dispatch(reset());
    }
  }, [isDone, dispatch, refetch]);

  return (
    <Stack width="full" gap="5">
      <ErrorToast error={error} />
      {displayData.length ? (
        <>
          <CsvTable data={displayData.slice(0, ROWS_PER_PAGE)} />
          <CsvPagination
            count={newRows.length ? displayData.length : total}
            page={page}
            onPageChange={setPage}
            disabled={isFetching}
          />
        </>
      ) : (
        <NoData />
      )}
    </Stack>
  );
}
