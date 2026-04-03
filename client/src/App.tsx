import { Flex, Stack } from "@chakra-ui/react";
import { useState } from "react";
import "./App.css";
import CsvDisplay from "./components/CsvDisplay/CsvDisplay";
import CsvForm from "./components/CsvForm/CsvForm";
import SearchForm from "./components/SearchForm/SearchForm";

export default function App() {
  const [filterText, setFilterText] = useState("");

  return (
    <main>
      <Stack gap={1}>
        <Flex gap={4} justify="space-between" alignItems="flex-start">
          <CsvForm />
          <SearchForm onSearch={setFilterText} />
        </Flex>
      </Stack>
      <CsvDisplay filter={filterText} />
    </main>
  );
}
