import { Table, Text } from "@chakra-ui/react";

export type Data = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

export default function CsvTable({ data }: { data: Data[] }) {
  return (
    <Table.ScrollArea borderWidth="1px" rounded="md" height="full">
      <Table.Root size="sm" native stickyHeader interactive showColumnBorder>
        <thead>
          <tr>
            <th>postId</th>
            <th>id</th>
            <th>name</th>
            <th>email</th>
            <th>body</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ postId, id, name, email, body }: Data) => (
            <tr key={id}>
              <td>{postId}</td>
              <td>{id}</td>
              <td>{name}</td>
              <td>{email}</td>
              <td>
                <Text whiteSpace="break-spaces">{body}</Text>
              </td>
            </tr>
          ))}
        </tbody>
      </Table.Root>
    </Table.ScrollArea>
  );
}
