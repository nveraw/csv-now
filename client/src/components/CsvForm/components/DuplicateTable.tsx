import type { Duplicate } from "@/types/upload";
import { Table, Text } from "@chakra-ui/react";
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
                <Table.Cell>{each.old.name}</Table.Cell>
                <Table.Cell>{each.old.email}</Table.Cell>
                <Table.Cell whiteSpace="break-spaces">
                  {each.old.body}
                </Table.Cell>
              </Table.Row>
              <Table.Row bg="gray.100">
                <Table.Cell>{each.new.postId}</Table.Cell>
                <Table.Cell>{each.new.id}</Table.Cell>
                <Table.Cell>{each.new.name}</Table.Cell>
                <Table.Cell>{each.new.email}</Table.Cell>
                <Table.Cell whiteSpace="break-spaces">
                  {each.new.body}
                </Table.Cell>
              </Table.Row>
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
