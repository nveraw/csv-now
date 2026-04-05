import { useConfirm } from "@/hooks/useConfirm";
import { useUploadCsv } from "@/hooks/useUpload";
import type { StoreState } from "@/store";
import { reset, setUploadId } from "@/store/uploadSlice";
import type { UploadOption } from "@/types/upload";
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
import ErrorToast from "../ErrorToast/ErrorToast";
import Loading from "../Loading/Loading";
import DuplicateDialog from "./components/DuplicateDialog";

export default function CsvForm() {
  const dispatch = useDispatch();

  const progress = useSelector((state: StoreState) => state.upload.progress);
  const id = useSelector((state: StoreState) => state.upload.id);
  const { uploaded, total } = progress || { uploaded: 0, total: 0 };

  const { mutate, isPending, error, data } = useUploadCsv();
  const confirm = useConfirm();

  const [fileName, setFilename] = useState("");

  const fileUpload = useFileUpload({
    maxFiles: 1,
    accept: ["text/csv"],
    maxFileSize: 10 * 1024 * 1024,
  });

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    const file = fileUpload.acceptedFiles[0];
    if (!file) return;
    setFilename(file.name);
    mutate(file, {
      onSuccess: ({ uploadId }) => {
        dispatch(setUploadId(uploadId));
      },
    });
  };

  const handleConfirm = (option: UploadOption) => {
    if (confirm.isPending) return;
    if (option === "cancel") {
      dispatch(reset());
    }
    if (id)
      confirm.mutate(
        { uploadId: id, option },
        {
          onSuccess: () => fileUpload.clearFiles(),
        },
      );
  };

  return (
    <Stack gap={2} flex="1">
      {uploaded !== total && !!id && (
        <Loading
          label={`Uploading ${fileName}`}
          percent={(uploaded / total) * 100}
        />
      )}
      <ErrorToast error={error || confirm.error} />
      <DuplicateDialog duplicate={data?.duplicate} onConfirm={handleConfirm} />
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
          <Button
            disabled={isPending || !fileUpload?.acceptedFiles?.[0]}
            bg="bg.subtle"
            variant="outline"
            type="submit"
          >
            Upload CSV
          </Button>
        </Group>
      </form>
    </Stack>
  );
}
