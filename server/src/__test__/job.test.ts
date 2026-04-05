import { beforeEach, describe, expect, it, vi } from "vitest";
import { startWork } from "../worker/job";
import { CsvJobData } from "../worker/queue";

const mockUnlink = vi.fn();
vi.mock("fs", async (importOriginal) => ({
  ...(await importOriginal()),
  default: {
    createReadStream: vi.fn().mockReturnValue({ pipe: vi.fn() }), // ← return a fake stream
    promises: {
      unlink: vi.fn((...arg) => mockUnlink(...arg)),
    },
  },
}));

const mockInsertBatch = vi.fn();
vi.mock("../libs/supabase", () => ({
  insertBatch: vi.fn((...arg) => mockInsertBatch(...arg)),
}));

const makeRow = vi.fn((id: number) => ({
  data: {
    postId: id,
    id: String(id),
    name: `Name${id}`,
    email: `e${id}@x.com`,
    body: `body ${id}`,
  },
}));
const mockParse = {
  pause: vi.fn(),
  resume: vi.fn(),
  abort: vi.fn(),
};
let papaMock = vi.fn();
vi.mock("papaparse", () => ({
  default: {
    parse: vi.fn((stream, opts) => papaMock(stream, opts)),
  },
}));

const mockJob = (overrides: Partial<CsvJobData> = {}): CsvJobData => ({
  socketId: "testSocketId",
  filePath: "/test/test.csv",
  option: "upsert",
  total: 2,
  uploadId: "testId",
  ...overrides,
});
const mockEmit = vi.fn();

describe("worker job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertBatch.mockResolvedValue({ error: null });
  });

  it("emit correctly", async () => {
    papaMock = vi.fn((_stream, opts) => {
      opts.step(makeRow(1), mockParse);
      opts.step(makeRow(2), mockParse);
      opts.complete();
    });
    await startWork(mockJob(), mockEmit);

    expect(mockEmit).toHaveBeenNthCalledWith(1, "upload_progress", 0, 2);
    expect(mockEmit).toHaveBeenLastCalledWith("upload_complete", 2, 2);
    expect(mockUnlink).toHaveBeenCalledWith("/test/test.csv");
  });

  it("call insert", async () => {
    papaMock = vi.fn((_stream, opts) => {
      opts.step(makeRow(1), mockParse);
      opts.complete();
    });
    await startWork(mockJob(), mockEmit);

    expect(mockInsertBatch).toHaveBeenCalledOnce();
    expect(mockInsertBatch).toHaveBeenCalledWith(
      [expect.objectContaining({ id: "1" })],
      "upsert",
    );
  });

  it("insert by batch and emit batch progress", async () => {
    papaMock = vi.fn((_stream, opts) => {
      const parser = { pause: vi.fn(), resume: vi.fn(), abort: vi.fn() };
      for (let i = 1; i <= 11; i++) opts.step(makeRow(i), parser);
      opts.complete();
    });

    await startWork(mockJob({ total: 11 }), mockEmit);

    expect(mockInsertBatch).toHaveBeenCalledTimes(2);
    // first call: 10 rows, second call: 1 row
    expect(mockInsertBatch).toHaveBeenNthCalledWith(
      1,
      expect.arrayContaining([expect.objectContaining({ id: "1" })]),
      "upsert",
    );
    expect(mockInsertBatch).toHaveBeenNthCalledWith(
      2,
      expect.arrayContaining([expect.objectContaining({ id: "11" })]),
      "upsert",
    );
    expect(mockEmit).toHaveBeenCalledWith("upload_complete", 11, 11);
  });

  it("map header correctly", async () => {
    papaMock = vi.fn((_stream, opts) => {
      opts.step(
        {
          data: {
            postId: 1,
            id: "1",
            name: "A",
            email: "a@x.com",
            body: "b",
            extraCol: "ignore me",
          },
        },
        { pause: vi.fn(), resume: vi.fn(), abort: vi.fn() },
      );
      opts.complete();
    });

    await startWork(mockJob(), mockEmit);

    const inserted = vi.mocked(mockInsertBatch).mock.calls[0][0];
    expect(inserted[0]).not.toHaveProperty("extraCol");
    expect(inserted[0]).toHaveProperty("postId");
  });

  it("reject when csv missing header", async () => {
    papaMock = vi.fn((_stream, opts) => {
      // missing postId, name, body
      opts.step(
        { data: { id: "1", email: "e@x.com" } },
        { pause: vi.fn(), resume: vi.fn(), abort: vi.fn() },
      );
      opts.complete();
    });

    await expect(startWork(mockJob(), mockEmit)).rejects.toThrow(
      "Missing required columns: postId, name, body",
    );
  });

  it("reject and abort when insertBatch error", async () => {
    const parser = { pause: vi.fn(), resume: vi.fn(), abort: vi.fn() };
    papaMock = vi.fn((_stream, opts) => {
      // send 10 rows to trigger a mid-stream batch flush
      for (let i = 1; i <= 10; i++) opts.step(makeRow(i), parser);
      opts.complete();
    });
    vi.mocked(mockInsertBatch).mockResolvedValue({
      error: new Error("DB write failed"),
    });

    await expect(startWork(mockJob({ total: 10 }), mockEmit)).rejects.toThrow(
      "DB write failed",
    );
    expect(parser.abort).toHaveBeenCalled();
  });

  it("reject when insertBatch error in complete step", async () => {
    papaMock = vi.fn((_stream, opts) => {
      opts.step(makeRow(1), {
        pause: vi.fn(),
        resume: vi.fn(),
        abort: vi.fn(),
      });
      opts.complete();
    });
    vi.mocked(mockInsertBatch).mockResolvedValue({
      error: new Error("flush failed"),
    } as any);

    await expect(startWork(mockJob({ total: 1 }), mockEmit)).rejects.toThrow(
      "flush failed",
    );
  });

  it("reject when PapaParse error", async () => {
    papaMock = vi.fn((_stream, opts) => {
      opts.error(new Error("stream corrupted"));
    });

    await expect(startWork(mockJob({ total: 1 }), mockEmit)).rejects.toThrow(
      "stream corrupted",
    );
  });
});
