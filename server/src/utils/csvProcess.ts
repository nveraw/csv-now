import fs from "fs";
import Papa from "papaparse";
import { CsvData } from "../types";

const VALID_HEADER = ["postId", "id", "name", "email", "body"];

export const transformHeader = (header: string) =>
  header
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/^"|"$/g, "");

export const validateHeader = (header: string[]) => {
  const missing = VALID_HEADER.filter((val) => !header.includes(val));
  const message =
    missing.length > 0 ? `Missing required columns: ${missing.join(", ")}` : "";
  return {
    message,
    requiresMapping: header.length > VALID_HEADER.length,
  };
};

export const mapRow = (row: CsvData, requiresMapping: boolean): CsvData =>
  requiresMapping
    ? (Object.fromEntries(
        Object.entries(row).filter(([key]) => VALID_HEADER.includes(key)),
      ) as CsvData)
    : row;

export const readCsv = async (
  filePath: string,
): Promise<Record<number, CsvData>> => {
  try {
    return new Promise((resolve, reject) => {
      const found: Record<number, CsvData> = {};
      const stream = fs.createReadStream(filePath, "utf8");

      let headerValidated = false;
      let headerMapRequired = false;

      Papa.parse(stream, {
        header: true,
        skipEmptyLines: true,
        transformHeader: transformHeader,
        step: (row: Papa.ParseStepResult<CsvData>) => {
          if (!headerValidated) {
            const { message, requiresMapping } = validateHeader(
              Object.keys(row.data),
            );
            if (message.length > 0) {
              throw new Error(message);
            }
            headerMapRequired = requiresMapping;
            headerValidated = true;
          }
          const id = Number(row.data.id);
          if (!isNaN(id)) {
            found[id] = mapRow(row.data, headerMapRequired);
          }
        },
        complete: () => resolve(found),
        error: reject,
      });
    });
  } catch (e) {
    await fs.promises.unlink(filePath);
    return {};
  }
};
