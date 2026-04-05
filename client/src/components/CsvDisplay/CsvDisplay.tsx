import { useTable } from "@/hooks/useTable";
import type { StoreState } from "@/store";
import { reset } from "@/store/uploadSlice";
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
  } = useTable({
    page,
    pageSize: ROWS_PER_PAGE,
    filter,
  });
  const { data, total } = response || {};

  const dispatch = useDispatch();
  const isDone = useSelector((state: StoreState) => state.upload.isDone);

  useEffect(() => {
    if (isDone) {
      refetch();
      dispatch(reset());
    }
  }, [isDone, dispatch, refetch]);

  return (
    <Stack width="full" gap="5">
      {/* {isFetching && <Loading label="Fetching data..." />} */}
      <ErrorToast error={error} />
      {data?.length ? (
        <>
          <CsvTable data={data} />
          <CsvPagination
            count={total || data.length}
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
