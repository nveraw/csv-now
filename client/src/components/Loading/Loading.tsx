import { Box, Center, Progress } from "@chakra-ui/react";

type LoadingProps = { label: string; uploaded?: number; total?: number };

export default function Loading({ label, uploaded, total }: LoadingProps) {
  const value = uploaded && total ? (uploaded / total) * 100 : null;
  return (
    <Box
      position="fixed"
      aria-busy="true"
      userSelect="none"
      w="dvw"
      h="dvh"
      top="0"
      left="0"
      zIndex={999}
    >
      <Box pos="absolute" inset="0" bg="bg/80">
        <Center h="full">
          <Progress.Root
            w="2xl"
            h="14px"
            striped
            animated
            textAlign="right"
            value={value}
          >
            <Progress.Label mb={4} w="full" textAlign="left">
              {label}
            </Progress.Label>
            <Progress.Track mb={4}>
              <Progress.Range />
            </Progress.Track>
            {!!value && <Progress.ValueText>{}%</Progress.ValueText>}
          </Progress.Root>
        </Center>
      </Box>
    </Box>
  );
}
