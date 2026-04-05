import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { tempScanStore } from "../libs/scanStore";
import uploadRouter from "../routes/upload";

const mockReadCsv = vi.fn();
vi.mock("../utils/csvProcess", () => ({
  readCsv: vi.fn(() => mockReadCsv()),
}));

const mockBatchSelect = vi.fn();
vi.mock("../libs/supabase", () => ({
  batchSelect: vi.fn((...arg) => mockBatchSelect(...arg)),
}));

const mockAddQueue = vi.fn();
vi.mock("../worker/queue", () => ({
  csvQueue: { add: vi.fn((...arg) => mockAddQueue(...arg)) },
  connection: {},
}));

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.__mockFile = req.__mockFile;
    next();
  });
  app.use("/api", uploadRouter);
  return app;
};

describe("POST /api/upload", () => {
  const app = buildApp();

  beforeEach(() => {
    vi.clearAllMocks();
    tempScanStore.clear();
    mockReadCsv.mockResolvedValue({ 1: { id: 1 }, 2: { id: 2 } });
    mockBatchSelect.mockResolvedValue([]);
  });

  it.skip("return 400 when no file", async () => {
    const res = await request(app)
      .post("/api/upload")
      .field("socketId", "testSocketId");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/file not found/i);
  });

  it.skip("return 500 when file is not csv", async () => {
    const res = await request(app)
      .post("/api/upload")
      .attach("file", Buffer.from("test"), "test.txt")
      .field("socketId", "testSocketId");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/csv file extensions are allowed/i);
  });

  it("add job to queue when no duplicate", async () => {
    mockReadCsv.mockResolvedValue({});

    const app = buildApp();
    const res = await request(app)
      .post("/api/upload")
      .attach("file", Buffer.from("test"), "test.csv")
      .field("socketId", "testSocketId");

    expect(res.status).toBe(200);

    expect(mockAddQueue).toHaveBeenCalledWith(
      "csv-insert",
      expect.objectContaining({
        socketId: "testSocketId",
        filePath: expect.any(String),
        option: "upsert",
        total: 0,
      }),
      expect.objectContaining({ jobId: expect.any(String) }),
    );
    expect(tempScanStore.size).toBe(0); // nothing stored
  });

  it.skip("add to store when duplicates exist", async () => {
    mockBatchSelect.mockResolvedValue([
      {
        postId: 1,
        id: 1,
        name: "Alice",
        email: "a@test.com",
        body: "hi",
      },
    ]);

    const app = buildApp();
    const res = await request(app)
      .post("/api/upload")
      .attach("file", Buffer.from("test"), "test.csv")
      .field("socketId", "testSocketId");

    expect(res.status).toBe(200);
    expect(res.body.uploadId).toBeDefined();

    expect(tempScanStore.size).toBe(1);
    const stored = tempScanStore.get(res.body.uploadId);
    expect(stored).toMatchObject({
      total: 2,
      socketId: expect.any(String),
      filePath: expect.any(String),
    });

    // queue must NOT have been called — user needs to confirm first
    expect(mockAddQueue).not.toHaveBeenCalled();
  });
});
