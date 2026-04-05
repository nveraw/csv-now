export type ScanSummary = {
  socketId: string;
  filePath: string;
  total: number;
};

export const tempScanStore = new Map<string, ScanSummary>();
