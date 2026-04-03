import {
  AbsoluteCenter,
  Accordion,
  ActionBar,
  Box,
  Flex,
  Float,
  Portal,
  ProgressCircle,
  Text,
} from "@chakra-ui/react";

type CsvProgressProps = {
  open: boolean;
  total: number;
  uploaded: number;
};

export default function CsvProgress({
  open = false,
  total,
  uploaded,
}: CsvProgressProps) {
  return (
    <Float placement="bottom-end">
      <Portal>
        <Box
          position="fixed"
          bottom="0"
          right="20px"
          zIndex="toast"
          width="320px"
        >
          <ActionBar.Root open={open} placement="bottom-end">
            <Portal>
              <ActionBar.Positioner>
                <ActionBar.Content>
                  <Accordion.Root multiple defaultValue={["b"]}>
                    <Accordion.Item value="uploading">
                      <Accordion.ItemTrigger>
                        <Text textStyle="sm" flex="1">
                          Uploading in Progress...
                        </Text>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Accordion.ItemBody>
                          <Flex gap={2} justify="space-between">
                            <Text textStyle="sm">data.csv</Text>
                            <CircularProgress value={uploaded / total} />
                          </Flex>
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  </Accordion.Root>
                </ActionBar.Content>
              </ActionBar.Positioner>
            </Portal>
          </ActionBar.Root>
        </Box>
      </Portal>
    </Float>
  );
}

function CircularProgress({ value }: { value: number }) {
  return (
    <ProgressCircle.Root size="sm" value={value}>
      <ProgressCircle.Circle>
        <ProgressCircle.Track />
        <ProgressCircle.Range />
      </ProgressCircle.Circle>
      <AbsoluteCenter>
        <ProgressCircle.ValueText />
      </AbsoluteCenter>
    </ProgressCircle.Root>
  );
}
