import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

export const csvQueue = new Queue("csv-queue", { connection });

export type CsvJobData = {
  uploadId: string;
  socketId: string;
  filePath: string;
  option: "ignore" | "upsert";
  total: number;
};
