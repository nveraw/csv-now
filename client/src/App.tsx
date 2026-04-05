import { Box, Flex, Stack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import CsvDisplay from "./components/CsvDisplay/CsvDisplay";
import CsvForm from "./components/CsvForm/CsvForm";
import SearchForm from "./components/SearchForm/SearchForm";
import { Toaster, toaster } from "./components/ui/toaster";
import type { StoreState } from "./store";

export default function App() {
  const [filterText, setFilterText] = useState("");
  const reconnectFailed = useSelector(
    (state: StoreState) => state.socket.reconnectFailed,
  );
  const toastRef = useRef<string>(null);

  useEffect(() => {
    const visible = toastRef.current
      ? toaster.isVisible(toastRef.current || "")
      : false;
    if (visible || !reconnectFailed) {
      return;
    }

    toastRef.current = toaster.create({
      description:
        "Live updates unavailable — progress will be shown when complete.",
      type: "warning",
      closable: true,
    });
  }, [reconnectFailed]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={3}
      py="10"
      maxW="800px"
      mx="auto"
    >
      {reconnectFailed && <Toaster />}
      <Stack gap={1}>
        <Flex gap={4} justify="space-between" alignItems="flex-start">
          <CsvForm />
          <SearchForm onSearch={setFilterText} />
        </Flex>
      </Stack>
      <CsvDisplay key={filterText} filter={filterText} />
    </Box>
  );
}
