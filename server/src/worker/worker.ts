import { Job, Worker } from "bullmq";
import fs from "fs";
import { Server as SocketServer } from "socket.io";
import { startWork } from "./job";
import { CsvJobData, connection } from "./queue";

export const createWorker = (io: SocketServer) => {
  const worker = new Worker<CsvJobData>(
    "csv-queue",
    async (job: Job<CsvJobData>) => {
      await startWork(job.data, io);
    },
    { connection, concurrency: 1 },
  );

  worker.on("failed", (job, err) => {
    if (!job) return;
    console.error("worker ERROR:", err);
    io.to(job.data.socketId).emit("upload_error", { message: err.message });
    fs.unlink(job.data.filePath, () => {});
  });

  return worker;
};
