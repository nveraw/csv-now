import type { Data } from "@/types/display";

export type Duplicate = {
  total: number;
  newCount: number;
  duplicateCount: number;
  sample: { id: number; old: Data; new: Data }[];
};

export type Progress = {
  uploaded: number;
  total: number;
};

export type UploadState = {
  id: string | null;
  progress: Progress | null;
  uploadError: string | null;
  isDone: boolean;
  newRows: Data[];
};

export type UploadOption = "ignore" | "update" | "cancel";
