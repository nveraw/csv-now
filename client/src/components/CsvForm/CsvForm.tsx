import { useUploadCsv } from "@/hooks/useUpload";
import type { StoreState } from "@/store";
import { reset } from "@/store/uploadSlice";
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
import { useState, type SubmitEvent } from "react";
import { HiUpload } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../Loading/Loading";
import { toaster } from "../ui/toaster";
import DuplicateDialog from "./components/DuplicateDialog";

export default function CsvForm() {
  const progress = useSelector((state: StoreState) => state.upload.progress);
  const { uploaded, total } = progress || { uploaded: 0, total: 0 };

  const dispatch = useDispatch();
  const { mutate, isPending, error, data } = useUploadCsv();
  const [fileName, setFilename] = useState("");

  const fileUpload = useFileUpload({
    maxFiles: 1,
    accept: ["text/csv"],
  });

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = fileUpload.acceptedFiles[0];
    if (!file) return;
    setFilename(file.name);
    mutate(file, {
      onSuccess: () => dispatch(reset()),
    });
  };

  if (error) {
    toaster.create({
      description: error.message,
      type: "error",
      closable: true,
    });
  }

  return (
    <Stack gap={2} flex="1">
      {uploaded !== total && (
        <Loading
          label={`Uploading ${fileName}`}
          percent={(uploaded / total) * 100}
        />
      )}
      <DuplicateDialog duplicate={data?.duplicate} />
      <form onSubmit={handleSubmit}>
        <Group attached w="full" maxW="sm">
          <FileUpload.RootProvider value={fileUpload}>
            <FileUpload.HiddenInput data-testid="hidden-file-input" />
            <InputGroup
              startElement={<HiUpload color={isPending ? "gray" : "unset"} />}
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
          </FileUpload.RootProvider>
          <Button bg="bg.subtle" variant="outline" type="submit">
            Upload CSV
          </Button>
        </Group>
      </form>
    </Stack>
  );
}
