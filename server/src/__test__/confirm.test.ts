import express from "express";
import fs from "fs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { tempScanStore } from "../libs/scanStore";
import confirmRouter from "../routes/confirm";

vi.mock("../libs/supabase", () => ({}));

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
  app.use("/api", confirmRouter);
  return app;
};

describe("POST /api/:uploadId/confirm", () => {
  const app = buildApp();

  beforeEach(() => {
    vi.clearAllMocks();
    tempScanStore.clear();
  });

  it("return 404 when uploadId is not in tempScanStore", async () => {
    const res = await request(app)
      .post("/api/null/confirm")
      .send({ option: "upsert" });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/file not found/i);
  });

  it("aborts and removes scan", async () => {
    const unlinkSpy = vi
      .spyOn(fs, "unlink")
      .mockImplementation((_path, cb: any) => cb(null));

    tempScanStore.set("testId", {
      filePath: "/test/test.csv",
      total: 5,
      socketId: "testSocketId",
    });

    const res = await request(app)
      .post("/api/testId/confirm")
      .send({ option: "abort" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("aborted");
    expect(tempScanStore.has("testId")).toBe(false);
    expect(unlinkSpy).toHaveBeenCalledWith(
      "/test/test.csv",
      expect.any(Function),
    );

    unlinkSpy.mockRestore();
  });

  it("queue job when option is upsert", async () => {
    mockAddQueue.mockResolvedValue({});

    tempScanStore.set("testId", {
      filePath: "/test/test.csv",
      total: 20,
      socketId: "testSocketId",
    });

    const res = await request(app)
      .post("/api/testId/confirm")
      .send({ option: "upsert" });

    expect(res.status).toBe(200);
    expect(res.body.uploadId).toBe("testId");
    expect(mockAddQueue).toHaveBeenCalledWith(
      "csv-insert",
      expect.objectContaining({
        filePath: "/test/test.csv",
        option: "upsert",
        total: 20,
        socketId: "testSocketId",
      }),
      expect.objectContaining({ jobId: expect.any(String) }),
    );
    // scan entry should be removed after queuing
    expect(tempScanStore.has("testId")).toBe(false);
  });

  it("queue job when option is ignore", async () => {
    mockAddQueue.mockResolvedValue({});

    tempScanStore.set("testId", {
      filePath: "/test/test.csv",
      total: 3,
      socketId: "testSocketId",
    });

    const res = await request(app)
      .post("/api/testId/confirm")
      .send({ option: "ignore" });

    expect(res.status).toBe(200);
    expect(mockAddQueue).toHaveBeenCalledWith(
      "csv-insert",
      expect.objectContaining({ option: "ignore" }),
      expect.anything(),
    );
  });
});
