import { ROWS_PER_PAGE } from "@/constant";
import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

type CsvPaginationProps = {
  count: number;
  page: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
};

export default function CsvPagination({
  count,
  page,
  disabled = false,
  onPageChange,
}: CsvPaginationProps) {
  return (
    <Pagination.Root
      count={count}
      pageSize={ROWS_PER_PAGE}
      page={page}
      onPageChange={(e) => onPageChange(e.page)}
      textAlign="center"
    >
      <ButtonGroup variant="ghost" size="sm" wrap="wrap">
        <Pagination.PrevTrigger asChild>
          <IconButton disabled={disabled}>
            <HiChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>

        <Pagination.Items
          render={(page) => (
            <IconButton
              disabled={disabled}
              variant={{ base: "ghost", _selected: "outline" }}
            >
              {page.value}
            </IconButton>
          )}
        />

        <Pagination.NextTrigger asChild>
          <IconButton disabled={disabled}>
            <HiChevronRight />
          </IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
  );
}
