import { useEffect, useRef } from "react";
import { Toaster, toaster } from "../ui/toaster";

type CsvErrorProps = {
  error?: Error | null;
};

export default function CsvError({ error }: CsvErrorProps) {
  const toastRef = useRef<string>(null);

  useEffect(() => {
    const visible = toastRef.current
      ? toaster.isVisible(toastRef.current || "")
      : false;
    if (visible || !error) {
      return;
    }

    toastRef.current = toaster.create({
      description: error.message,
      type: "error",
      closable: true,
    });
  }, [error]);

  if (!error) {
    return null;
  }

  return <Toaster key={error.message} />;
}
