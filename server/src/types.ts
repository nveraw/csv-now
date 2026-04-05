export type CsvData = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

export type CsvDuplicate = {
  total: number;
  newCount: number;
  duplicateCount: number;
  sample: { id: number; old: CsvData; new: CsvData }[];
};
