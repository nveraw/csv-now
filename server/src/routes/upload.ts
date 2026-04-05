import crypto from "crypto";
import express from "express";
import { createReadStream } from "fs";
import multer from "multer";
import Papa from "papaparse";
import { tempScanStore } from "../libs/scanStore";
import { getExisting } from "../libs/supabase";
import { CsvJobData, csvQueue } from "../queue";
import { CsvData, CsvDuplicate } from "../types";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["text/csv", "application/vnd.ms-excel", "text/plain"];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
});

const CHUNK_SIZE = 10_000;

const handleDuplicate = async (
  ids: number[],
): Promise<CsvData[] | undefined> => {
  const dataInDb: CsvData[] = [];
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const { data } = await getExisting(chunk);
    dataInDb.push(...(data ?? []));
    if (dataInDb.length >= 10) {
      return dataInDb.slice(0, 10);
    }
  }

  return;
};

const readCsv = async (filePath: string): Promise<Record<number, CsvData>> => {
  return new Promise((resolve, reject) => {
    const found: Record<number, CsvData> = {};
    const stream = createReadStream(filePath, "utf8");

    Papa.parse(stream, {
      header: true,
      skipEmptyLines: true,
      step: (row: Papa.ParseStepResult<CsvData>) => {
        const id = Number(row.data.id);
        if (!isNaN(id)) {
          found[id] = row.data;
        }
      },
      complete: () => resolve(found),
      error: reject,
    });
  });
};

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const socketId = req.body.socketId as string;

    if (!file) {
      console.error("upload ERROR: missing payload file");
      return res
        .status(400)
        .json({ error: "File not found. Try reuploading." });
    }

    console.log("upload start", socketId, file.path);

    const existingFromCsv = await readCsv(file.path);
    const allIds = Object.keys(existingFromCsv).map((id) => Number(id));
    const total = allIds.length;

    const dataInDb = await handleDuplicate(allIds);

    let uploadId = crypto.randomUUID();
    let duplicate: CsvDuplicate | undefined;
    if (dataInDb) {
      console.log("upload duplicate found storing", uploadId);
      duplicate = {
        duplicateCount: dataInDb.length,
        newCount: total - dataInDb.length,
        sample: dataInDb.slice(0, 10).map((dbData) => ({
          id: dbData.id,
          old: dbData,
          new: existingFromCsv[dbData.id],
        })), // sneak peek of duplicate data (Partial)
        total,
      };

      tempScanStore.set(uploadId, {
        filePath: file.path,
        total,
        socketId,
      });
    } else {
      console.log("upload queuing", uploadId);
      await csvQueue.add(
        "csv-insert",
        {
          uploadId,
          socketId,
          filePath: file.path,
          option: "upsert",
          total,
        } as CsvJobData,
        {
          jobId: uploadId,
        },
      );
    }

    res.json({ uploadId, duplicate });
  } catch (e) {
    console.error("upload ERROR:", e);
  }
});

export default router;
