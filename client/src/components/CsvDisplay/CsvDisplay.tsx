import { Stack } from "@chakra-ui/react";
import { useState } from "react";
import CsvPagination from "./components/CsvPagination";
import type { Data } from "./components/CsvTable";
import CsvTable from "./components/CsvTable";
import "./csvDisplay.css";

const ROWS_PER_PAGE = 5;

export default function CsvDisplay({ filter }: { filter?: string }) {
  const [page, setPage] = useState(1);
  const data: Data[] = [
    {
      postId: 1,
      id: 1,
      name: "name1",
      email: "email1@mail.com",
      body: "qui ipsa animi nostrum praesentium voluptatibus odit\nqui non impedit cum qui nostrum aliquid fuga explicabo\nvoluptatem fugit earum voluptas exercitationem temporibus dignissimos distinctio\nesse inventore reprehenderit quidem ut incidunt nihil necessitatibus rerum",
    },
    {
      postId: 1,
      id: 2,
      name: "name2",
      email: "email2@mail.com",
      body: "post 2",
    },
    {
      postId: 1,
      id: 3,
      name: "name3",
      email: "email3@mail.com",
      body: "post 3",
    },
    {
      postId: 2,
      id: 4,
      name: "name4",
      email: "email4@mail.com",
      body: "post 4",
    },
    {
      postId: 3,
      id: 5,
      name: "name5",
      email: "email5@mail.com",
      body: "post 5",
    },
    {
      postId: 4,
      id: 6,
      name: "name6",
      email: "email6@mail.com",
      body: "post 6",
    },
    {
      postId: 3,
      id: 7,
      name: "name7",
      email: "email7@mail.com",
      body: "post 7",
    },
    {
      postId: 3,
      id: 8,
      name: "name8",
      email: "email8@mail.com",
      body: "post 8",
    },
    {
      postId: 3,
      id: 9,
      name: "name9",
      email: "email9@mail.com",
      body: "post 9",
    },
    {
      postId: 3,
      id: 10,
      name: "name10",
      email: "email10@mail.com",
      body: "post 10",
    },
    {
      postId: 4,
      id: 11,
      name: "name11",
      email: "email11@mail.com",
      body: "post 11",
    },
    {
      postId: 3,
      id: 12,
      name: "name11",
      email: "email11@mail.com",
      body: "post 11",
    },
  ].filter((each) =>
    !filter
      ? each
      : each.name.includes(filter) ||
        each.email.includes(filter) ||
        each.body.includes(filter),
  );
  return (
    <Stack width="full" gap="5">
      <CsvTable
        data={[...data].splice(
          ROWS_PER_PAGE * (page - 1),
          ROWS_PER_PAGE * page,
        )}
      />
      <CsvPagination count={data.length} page={page} onPageChange={setPage} />
    </Stack>
  );
}
