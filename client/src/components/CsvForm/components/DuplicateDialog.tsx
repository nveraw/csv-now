import type { Duplicate } from "@/types/upload";
import {
  Button,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Separator,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { PiWarningLight } from "react-icons/pi";
import DuplicateTable from "./DuplicateTable";

type DuplicateDialogProps = {
  duplicate?: Duplicate;
};

export default function DuplicateDialog({ duplicate }: DuplicateDialogProps) {
  const [open, setOpen] = useState(!!duplicate);

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
              <Dialog.Title>
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
              <DuplicateTable data={duplicate?.sample} />
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline">Insert & IGNORE duplicate</Button>
              <Button>Insert & UPDATE duplicate</Button>
              <Button colorPalette="red">Abort</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
