import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import recordRouter from "../routes/record";

const mockGetRecords = vi.fn();
vi.mock("../libs/supabase", () => ({
  getRecords: vi.fn((...arg) => mockGetRecords(...arg)),
}));

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.__mockFile = req.__mockFile;
    next();
  });
  app.use("/api", recordRouter);
  return app;
};

describe("GET /api/records", () => {
  const app = buildApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("return correctly", async () => {
    mockGetRecords.mockResolvedValue({
      data: [{ id: 1, postId: 1, name: "Alice", email: "a@a.com", body: "hi" }],
      count: 1,
      error: null,
    });

    const res = await request(app).get("/api/records");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(50);
    expect(mockGetRecords).toHaveBeenCalledWith(0, 49, "");
  });

  it("retrieve with page and pageSize", async () => {
    mockGetRecords.mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    const res = await request(app).get("/api/records?page=3&pageSize=10");

    expect(res.status).toBe(200);
    expect(mockGetRecords).toHaveBeenCalledWith(20, 29, "");
  });

  it("retrieve with filter", async () => {
    mockGetRecords.mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    await request(app).get("/api/records?filter=alice");

    expect(mockGetRecords).toHaveBeenCalledWith(0, 49, "alice");
  });

  it("return error", async () => {
    mockGetRecords.mockResolvedValue({
      data: null,
      count: null,
      error: { message: "mock error" },
    });

    const res = await request(app).get("/api/records");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("mock error");
  });
});
