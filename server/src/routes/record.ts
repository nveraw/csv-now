import express from "express";
import { getRecords } from "../libs/supabase";

const router = express.Router();

router.get("/records", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const filter = (req.query.filter as string) ?? "";

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await getRecords(from, to, filter);
    if (error) {
      console.error("records ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ data, total: count, page, pageSize });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Unknown eror has occured. Try agian a moment later" });
    console.error("records ERROR:", e);
  }
});

export default router;
