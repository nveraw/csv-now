import express from "express";
import fs from "fs";
import { tempScanStore } from "../libs/scanStore";
import { CsvJobData, csvQueue } from "../worker/queue";

const router = express.Router();

router.post("/:uploadId/confirm", async (req, res) => {
  try {
    const { option } = req.body;
    const { uploadId } = req.params;

    const scan = tempScanStore.get(uploadId);
    if (!scan) {
      console.error("upload ERROR: missing scan store");
      return res
        .status(404)
        .json({ error: "File not found. Try reuploading." });
    }
    tempScanStore.delete(uploadId);

    if (option === "abort") {
      console.log("upload ABORTED");
      fs.unlink(scan.filePath, () => {});
      return res.json({ status: "aborted" });
    }

    const processId = crypto.randomUUID();

    await csvQueue.add(
      "csv-insert",
      {
        uploadId: processId,
        socketId: scan.socketId,
        filePath: scan.filePath,
        option,
        total: scan.total,
      } as CsvJobData,
      {
        jobId: processId,
      },
    );

    res.json({ uploadId });
  } catch (e) {
    console.error("confirm ERROR:", e);
    res
      .status(500)
      .json({ error: "Unknown eror has occured. Try agian a moment later" });
  }
});

export default router;
