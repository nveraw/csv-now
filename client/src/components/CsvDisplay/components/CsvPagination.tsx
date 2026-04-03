import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

type CsvPaginationProps = {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
};

const ROWS_PER_PAGE = 5;

export default function CsvPagination({
  count,
  page,
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
          <IconButton>
            <HiChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>

        <Pagination.Items
          render={(page) => (
            <IconButton variant={{ base: "ghost", _selected: "outline" }}>
              {page.value}
            </IconButton>
          )}
        />

        <Pagination.NextTrigger asChild>
          <IconButton>
            <HiChevronRight />
          </IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
  );
}
