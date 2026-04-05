import type { Duplicate } from "@/types/upload";
import { Table, Text } from "@chakra-ui/react";
import dompurify from "dompurify";
import { Fragment } from "react";

type DuplicateTableProps = {
  data: Duplicate["sample"];
};

export default function DuplicateTable({ data }: DuplicateTableProps) {
  if (!data) {
    return null;
  }
  return (
    <Table.ScrollArea maxH="sm">
      <Table.Root>
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
            <Fragment key={each.id}>
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text fontWeight="bold">id: {each.id}</Text>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>{each.old.postId}</Table.Cell>
                <Table.Cell>{each.old.id}</Table.Cell>
                <Table.Cell whiteSpace="pre-line">{each.old.name}</Table.Cell>
                <Table.Cell whiteSpace="pre-line">{each.old.email}</Table.Cell>
                <Table.Cell whiteSpace="pre-line">
                  {dompurify.sanitize(each.old.body).split("\\n").join("\n")}
                </Table.Cell>
              </Table.Row>
              <Table.Row bg="gray.100">
                <Table.Cell>{each.new.postId}</Table.Cell>
                <Table.Cell>{each.new.id}</Table.Cell>
                <Table.Cell whiteSpace="pre-line">{each.new.name}</Table.Cell>
                <Table.Cell whiteSpace="pre-line">{each.new.email}</Table.Cell>
                <Table.Cell whiteSpace="pre-line">
                  {dompurify.sanitize(each.new.body).split("\\n").join("\n")}
                </Table.Cell>
              </Table.Row>
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
