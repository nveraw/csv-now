import { Job, Worker } from "bullmq";
import fs, { createReadStream } from "fs";
import Papa from "papaparse";
import { Server as SocketServer } from "socket.io";
import { insertBatch } from "./libs/supabase";
import { CsvJobData, connection } from "./queue";
import { CsvData } from "./types";

const BATCH_SIZE = 10;
const VALID_HEADER = ["postId", "id", "name", "email", "body"];

export const createWorker = (io: SocketServer) => {
  const worker = new Worker<CsvJobData>(
    "csv-queue",
    async (job: Job<CsvJobData>) => {
      const { socketId, filePath, option, total } = job.data;

      console.log("worker start", socketId);

      let buffer: CsvData[] = [];
      let uploaded = 0;

      await new Promise<void>((resolve, reject) => {
        const stream = createReadStream(filePath, "utf8");
        console.log("worker streaming", filePath);
        io.to(socketId).emit("upload_progress", { uploaded, total }); // kick start

        let headerValidated = false;
        let headerMapRequired = false;

        Papa.parse(stream, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) =>
            header
              .trim()
              .replace(/^\uFEFF/, "")
              .replace(/^"|"$/g, ""),

          step: async (row: Papa.ParseStepResult<CsvData>, parser) => {
            if (!headerValidated) {
              const header = Object.keys(row.data);
              const missing = VALID_HEADER.filter(
                (val) => !header.includes(val),
              );
              if (missing.length > 0) {
                parser.abort();
                return reject(
                  new Error(`Missing required columns: ${missing.join(", ")}`),
                );
              }
              headerMapRequired = header.length > VALID_HEADER.length;
              headerValidated = true;
            }
            const data: CsvData = headerMapRequired
              ? (Object.fromEntries(
                  Object.entries(row.data).filter(([key]) =>
                    VALID_HEADER.includes(key),
                  ),
                ) as CsvData)
              : row.data;
            buffer.push(data);
            console.log("worker reading", data);

            if (buffer.length >= BATCH_SIZE) {
              parser.pause();
              try {
                const { error } = await insertBatch(buffer, option);
                if (error) {
                  console.error("worker PARSER-ERROR:", error);
                  throw error;
                }

                uploaded += buffer.length;
                buffer = [];

                io.to(socketId).emit("upload_progress", { uploaded, total });
              } catch (err) {
                console.error("worker PARSER-ERROR:", err);
                parser.abort();
                return reject(err);
              }
              parser.resume();
            }
          },

          complete: async () => {
            try {
              console.log("worker reading completed");
              if (buffer.length > 0) {
                const { error } = await insertBatch(buffer, option);
                if (error) {
                  console.error("worker PARSER-COMPLETE-ERROR:", error, buffer);
                  throw error;
                }
                uploaded += buffer.length;
              }
              io.to(socketId).emit("upload_complete", { uploaded, total });
              fs.unlinkSync(filePath);
              resolve();
            } catch (err) {
              console.error("worker PARSER-COMPLETE-ERROR:", err);
              reject(err);
            }
          },

          error: reject,
        });
      });
    },
    { connection, concurrency: 3 },
  );

  worker.on("failed", (job, err) => {
    if (!job) return;
    console.error("worker ERROR:", err);
    io.to(job.data.socketId).emit("upload_error", { message: err.message });
    fs.unlink(job.data.filePath, () => {});
  });

  return worker;
};
