import { Box, Table, Text } from "@chakra-ui/react";

export default function NoData() {
  return (
    <Box position="relative" w="full">
      <Box
        position="absolute"
        bg="bg/60"
        w="full"
        h="full"
        zIndex="2"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontStyle="italic">Be the first to upload</Text>
      </Box>
      <Table.ScrollArea borderWidth="1px" rounded="md" h="full" w="full">
        <Table.Root
          size="sm"
          minH="300px"
          native
          stickyHeader
          interactive
          showColumnBorder
        >
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
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}
