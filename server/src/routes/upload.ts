import crypto from "crypto";
import express from "express";
import multer from "multer";
import path from "path";
import { tempScanStore } from "../libs/scanStore";
import { batchSelect } from "../libs/supabase";
import { CsvDuplicate } from "../types";
import { readCsv } from "../utils/csvProcess";
import { CsvJobData, csvQueue } from "../worker/queue";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["text/csv", "application/vnd.ms-excel", "text/plain"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedMimes.includes(file.mimetype) || ext !== ".csv") {
      return cb(new Error("Only .csv file extensions are allowed"));
    }
    cb(null, true);
  },
});

router.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const file = req.file;
      const socketId = req.body?.socketId as string;

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

      const dataInDb = await batchSelect(allIds);

      const uploadId = crypto.randomUUID();
      let duplicate: CsvDuplicate | undefined;
      if (dataInDb.length > 0) {
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
      res
        .status(500)
        .json({ error: "Unknown eror has occured. Try agian a moment later" });
      console.error("upload ERROR:", e);
    }
  },
);

export default router;
