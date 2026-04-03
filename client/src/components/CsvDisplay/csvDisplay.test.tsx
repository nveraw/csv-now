import { data } from "@/mocks/table";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "../ui/provider";
import CsvDisplay from "./CsvDisplay";

const mockUseTable = vi.fn();
vi.mock("@/hooks/useTable", () => ({ useTable: vi.fn(() => mockUseTable()) }));

const mockToasterCreate = vi.fn();
vi.mock("../ui/toaster", () => ({
  toaster: { create: vi.fn((...arg) => mockToasterCreate(...arg)) },
  Toaster: vi.fn(),
}));

const renderComponent = async () =>
  await act(() =>
    render(
      <Provider>
        <CsvDisplay />
      </Provider>,
    ),
  );

describe("CsvDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("render correctly", async () => {
    mockUseTable.mockReturnValue({
      data: { data, total: data.length },
      error: null,
      isFetching: false,
    });

    await renderComponent();

    const table = screen.getByRole("table");
    const pagination = screen.getByLabelText("pagination");

    expect(table).toBeDefined();
    expect(
      within(table).getByRole("row", {
        name: Object.values(data[0]).join(" "),
      }),
    ).toBeDefined();

    expect(pagination).toBeDefined();
    expect(
      within(pagination).getByRole("button", { name: "previous page" }),
    ).toBeDefined();
    [1, 2].map((i) =>
      expect(
        within(pagination).getByRole("button", { name: `page ${i}` }),
      ).toBeDefined(),
    );
    expect(
      within(pagination).getByRole("button", { name: `last page, page 3` }),
    ).toBeDefined();
    expect(
      within(pagination).getByRole("button", { name: "next page" }),
    ).toBeDefined();

    expect(mockToasterCreate).not.toHaveBeenCalled();
  });

  it("return null when data is undefined", async () => {
    mockUseTable.mockReturnValue({
      data: undefined,
      error: undefined,
      isFetching: false,
    });

    await renderComponent();

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("pagination")).not.toBeInTheDocument();
  });

  it("show toaster error", async () => {
    mockUseTable.mockReturnValue({
      data: undefined,
      error: new Error("Fetch failed"),
      isFetching: false,
    });

    await renderComponent();

    expect(mockToasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Fetch failed",
        type: "error",
        closable: true,
      }),
    );
  });

  it("show toaster when isFetching", async () => {
    mockUseTable.mockReturnValue({
      data: { data, total: data.length },
      error: undefined,
      isFetching: true,
    });

    await renderComponent();

    expect(screen.getByText("Fetching data...")).toBeDefined();
  });

  it("update page and render second page when pagination next", async () => {
    const user = userEvent.setup();
    mockUseTable.mockReturnValue({
      data: { data, total: data.length },
      error: undefined,
      isFetching: false,
    });

    await renderComponent();

    const pagination = screen.getByLabelText("pagination");
    expect(pagination).toBeDefined();

    const nextButton = within(pagination).getByRole("button", {
      name: "next page",
    });
    await user.click(nextButton);

    const table = screen.getByRole("table");

    expect(
      within(table).getByRole("row", {
        name: Object.values(data[7]).join(" "),
      }),
    ).toBeDefined();
  });
});
