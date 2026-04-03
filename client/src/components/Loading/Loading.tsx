import { Box, Center, Progress } from "@chakra-ui/react";

type LoadingProps = { label: string; uploaded: number; total: number };

export default function Loading({ label, uploaded, total }: LoadingProps) {
  return (
    <Box
      position="fixed"
      aria-busy="true"
      userSelect="none"
      w="dvw"
      h="dvh"
      zIndex={999}
    >
      <Box pos="absolute" inset="0" bg="bg/80">
        <Center h="full">
          {/* <Stack gap={2}>
            <Spinner color="teal.500" mx="auto" />
            <Text color="colorPalette.600">
              Loading... ({(uploaded * 100) / total}%)
            </Text>
          </Stack> */}
          <Progress.Root w="2xl" h="14px" striped animated textAlign="right">
            <Progress.Label mb={4} w="full" textAlign="left">
              {label}
            </Progress.Label>
            <Progress.Track mb={4}>
              <Progress.Range />
            </Progress.Track>
            <Progress.ValueText>{(uploaded / total) * 100}%</Progress.ValueText>
          </Progress.Root>
        </Center>
      </Box>
    </Box>
  );
}
