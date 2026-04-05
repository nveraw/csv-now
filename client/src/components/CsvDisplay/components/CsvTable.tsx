import type { Data } from "@/types/display";
import { Table } from "@chakra-ui/react";
import dompurify from "dompurify";

export default function CsvTable({ data }: { data: Data[] }) {
  return (
    <Table.ScrollArea borderWidth="1px" rounded="md" height="full">
      <Table.Root size="sm" native stickyHeader interactive showColumnBorder>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>postId</Table.ColumnHeader>
            <Table.ColumnHeader>id</Table.ColumnHeader>
            <Table.ColumnHeader>name</Table.ColumnHeader>
            <Table.ColumnHeader>email</Table.ColumnHeader>
            <Table.ColumnHeader>body</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((each) => (
            <Table.Row key={each.id}>
              <Table.Cell>{each.postId}</Table.Cell>
              <Table.Cell>{each.id}</Table.Cell>
              <Table.Cell whiteSpace="pre-line">{each.name}</Table.Cell>
              <Table.Cell whiteSpace="pre-line">{each.email}</Table.Cell>
              <Table.Cell whiteSpace="pre-line">
                {dompurify.sanitize(each.body).split("\\n").join("\n")}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
