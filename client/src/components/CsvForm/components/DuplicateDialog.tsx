import type { Duplicate, UploadOption } from "@/types/upload";
import {
  Button,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Separator,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { PiWarningLight } from "react-icons/pi";
import DuplicateTable from "./DuplicateTable";

type DuplicateDialogProps = {
  duplicate?: Duplicate;
  onConfirm: (option: UploadOption) => void;
};

export default function DuplicateDialog({
  duplicate,
  onConfirm,
}: DuplicateDialogProps) {
  const [open, setOpen] = useState(true);

  // fix chakra-ui error
  useEffect(() => {
    if (!open) {
      document.body.style = "";
    }
  }, [open]);

  const handleClick = (option: UploadOption) => {
    setOpen(false);
    onConfirm(option);
  };

  if (!duplicate) {
    return null;
  }

  return (
    <Dialog.Root
      role="alertdialog"
      open={open}
      size="lg"
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title display="flex" alignItems="center" gap={2}>
                <PiWarningLight color="red" /> ID(s) Exist!
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <HStack>
                Total: <Text fontWeight="bold">{duplicate?.total}</Text> row(s).
              </HStack>
              <HStack>
                With: <Text fontWeight="bold">{duplicate?.newCount}</Text> new.
              </HStack>
              <HStack>
                Found:
                <Text fontWeight="bold">{duplicate?.duplicateCount}</Text>
                existed.
              </HStack>
              <Separator />
              {duplicate && <DuplicateTable data={duplicate?.sample} />}
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => handleClick("ignore")} variant="outline">
                Insert & IGNORE duplicate
              </Button>
              <Button onClick={() => handleClick("update")}>
                Insert & UPDATE duplicate
              </Button>
              <Button onClick={() => handleClick("cancel")} colorPalette="red">
                Cancel
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
