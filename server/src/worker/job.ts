import fs from "fs";
import Papa from "papaparse";
import { insertBatch } from "../libs/supabase";
import { CsvData } from "../types";
import { mapRow, transformHeader, validateHeader } from "../utils/csvProcess";
import { CsvJobData } from "./queue";

const BATCH_SIZE = 10;

export const startWork = async (
  jobData: CsvJobData,
  onEmit: (state: string, uploaded: number, total: number) => void,
) => {
  const { socketId, filePath, option, total } = jobData;

  console.log("worker start", socketId);

  let buffer: CsvData[] = [];
  let uploaded = 0;

  await new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream(filePath, "utf8");
    console.log("worker streaming", filePath);
    onEmit("upload_progress", uploaded, total); // kick start

    let headerValidated = false;
    let headerMapRequired = false;

    Papa.parse(stream, {
      header: true,
      skipEmptyLines: true,
      transformHeader,

      step: (row: Papa.ParseStepResult<CsvData>, parser) => {
        if (!headerValidated) {
          const { message, requiresMapping } = validateHeader(
            Object.keys(row.data),
          );
          if (message.length > 0) {
            parser.abort();
            return reject(new Error(message));
          }
          headerMapRequired = requiresMapping;
          headerValidated = true;
        }
        const data: CsvData = mapRow(row.data, headerMapRequired);
        buffer.push(data);
        console.log("worker reading", data);

        if (buffer.length >= BATCH_SIZE) {
          parser.pause();
          const flushed = buffer;
          buffer = [];
          insertBatch(flushed, option)
            .then(({ error }) => {
              if (error) {
                console.error("worker PARSER-ERROR:", error);
                parser.abort();
                reject(error);
              }
              uploaded += flushed.length;

              onEmit("upload_progress", uploaded, total);
              parser.resume();
            })
            .catch((err) => {
              console.error("worker PARSER-ERROR:", err);
              parser.abort();
              return reject(err);
            });
        }
      },

      complete: async () => {
        if (buffer.length > 0) {
          const { error } = await insertBatch(buffer, option);
          if (error) {
            console.error("worker PARSER-COMPLETE-ERROR:", error);
            reject(error);
          }
          uploaded += buffer.length;
        }
        onEmit("upload_complete", uploaded, total);
        await fs.promises.unlink(filePath);
        resolve();
      },

      error: reject,
    });
  });
};
