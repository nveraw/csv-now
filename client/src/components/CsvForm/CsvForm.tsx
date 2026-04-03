import {
  Button,
  CloseButton,
  FileUpload,
  Group,
  Input,
  InputGroup,
  Stack,
  useFileUpload,
} from "@chakra-ui/react";
import { type SubmitEvent } from "react";
import { HiUpload } from "react-icons/hi";
import Loading from "../Loading/Loading";

export default function CsvForm() {
  const isFetching = false;

  const fileUpload = useFileUpload({
    maxFiles: 1,
  });

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = fileUpload.acceptedFiles.map((file) => file.name)[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:3001/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <Stack gap={2} flex="1">
      {isFetching && (
        <Loading uploaded={60} total={100} label="Uploading data.csv" />
      )}
      <form onSubmit={handleSubmit}>
        <Group attached w="full" maxW="sm">
          <FileUpload.Root accept={["text/csv"]} gap="1" maxWidth="300px">
            <FileUpload.HiddenInput />
            <InputGroup
              startElement={<HiUpload color={isFetching ? "gray" : "unset"} />}
              endElement={
                <FileUpload.ClearTrigger asChild>
                  <CloseButton
                    me="-1"
                    size="xs"
                    variant="plain"
                    focusVisibleRing="inside"
                    focusRingWidth="2px"
                    pointerEvents="auto"
                  />
                </FileUpload.ClearTrigger>
              }
            >
              <Input asChild>
                <FileUpload.Trigger>
                  <FileUpload.FileText lineClamp={1} />
                </FileUpload.Trigger>
              </Input>
            </InputGroup>
          </FileUpload.Root>
          <Button bg="bg.subtle" variant="outline" type="submit">
            Upload CSV
          </Button>
        </Group>
      </form>
    </Stack>
  );
}
