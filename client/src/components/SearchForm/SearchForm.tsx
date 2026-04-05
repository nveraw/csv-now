import { Box, Button, Group, Input } from "@chakra-ui/react";
import { useRef, type KeyboardEvent } from "react";

type SearchFormProps = { onSearch: (value: string) => void };

export default function SearchForm({ onSearch }: SearchFormProps) {
  const searchElm = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <Box flex="1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = searchElm.current?.value?.trim();
          onSearch(value || "");
        }}
      >
        <Group attached w="full" maxW="md" ml="auto" display="flex">
          <Input
            autoFocus
            flex="1"
            placeholder="Search Text"
            name="search"
            ref={searchElm}
            onKeyDown={handleKeyDown}
            maxLength={100}
            pattern="^[a-zA-Z0-9\s]*$"
          />
          <Button type="submit" bg="bg.subtle" variant="outline">
            Search
          </Button>
        </Group>
      </form>
    </Box>
  );
}
