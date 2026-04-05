import { duplicate } from "@/mocks/duplicate";
import store from "@/store";
import { upload, uploadComplete } from "@/store/uploadSlice";
import "@testing-library/jest-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "../ui/provider";
import CsvForm from "./CsvForm";

const mockUseUpload = vi.fn();
vi.mock("@/hooks/useUpload", () => ({
  useUploadCsv: vi.fn(() => mockUseUpload()),
}));

const mockToasterCreate = vi.fn();
vi.mock("../ui/toaster", () => ({
  toaster: { create: vi.fn((...arg) => mockToasterCreate(...arg)) },
  Toaster: vi.fn(),
}));

const renderComponent = async () =>
  await act(() =>
    render(
      <ReduxProvider store={store}>
        <Provider>
          <CsvForm />
        </Provider>
      </ReduxProvider>,
    ),
  );

describe("CsvForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.dispatch(uploadComplete({ uploaded: 100, total: 100 })); // Reset store state
    mockUseUpload.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: undefined,
    });
  });

  it("render with input and submit", async () => {
    await renderComponent();

    expect(screen.getByText(/Select file/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /upload csv/i }),
    ).toBeInTheDocument();
  });

  it("show loading when uploading", async () => {
    store.dispatch(upload({ uploaded: 50, total: 100 }));
    await renderComponent();

    expect(screen.getByText("Uploading")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("does not show loading when upload completed", async () => {
    store.dispatch(upload({ uploaded: 100, total: 100 }));
    await renderComponent();

    expect(screen.queryByText("Uploading")).not.toBeInTheDocument();
  });

  it("show error toast", async () => {
    mockUseUpload.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: new Error("Upload failed"),
    });
    await renderComponent();

    expect(mockToasterCreate).toHaveBeenCalledWith({
      description: "Upload failed",
      type: "error",
      closable: true,
    });
  });

  it("submit form", async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();
    mockUseUpload.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      error: undefined,
    });
    await renderComponent();
    const file = new File(["content"], "test.csv", { type: "text/csv" });
    const hiddenInput = screen.getByTestId(
      "hidden-file-input",
    ) as HTMLInputElement;

    await user.upload(hiddenInput, file);
    const submitButton = screen.getByRole("button", { name: /upload csv/i });
    await user.click(submitButton);

    expect(mutateMock).toHaveBeenCalledWith(file, expect.anything());
  });

  it("does not submit if no file selected", async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();
    mockUseUpload.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      error: undefined,
    });

    await renderComponent();

    const submitButton = screen.getByRole("button", { name: /upload csv/i });
    await user.click(submitButton);

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("set file name", async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();
    mockUseUpload.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      error: undefined,
    });
    await renderComponent();
    const file = new File(["content"], "test.csv", { type: "text/csv" });
    const hiddenInput = screen.getByTestId(
      "hidden-file-input",
    ) as HTMLInputElement;

    await user.upload(hiddenInput, file);

    await waitFor(async () => {
      const submitButton = screen.getByRole("button", { name: /upload csv/i });
      await user.click(submitButton);
      store.dispatch(upload({ uploaded: 50, total: 100 }));
      await renderComponent();

      expect(screen.getByText("Uploading test.csv")).toBeInTheDocument();
    });
  });

  it("renders DuplicateDialog when duplicate data exists", async () => {
    mockUseUpload.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: undefined,
      data: { duplicate },
    });
    await renderComponent();
    const dialog = within(screen.getByRole("alertdialog"));

    expect(dialog.getByText(/id\(s\) exist/i)).toBeInTheDocument();

    const total = dialog.getByText(/total:/i);
    expect(total).toBeInTheDocument();
    expect(within(total).getByText(/3/)).toBeInTheDocument();
    expect(within(total).getByText(/row/)).toBeInTheDocument();

    const newContent = dialog.getByText(/with:/i);
    expect(newContent).toBeInTheDocument();
    expect(within(newContent).getByText(/2/)).toBeInTheDocument();
    expect(within(newContent).getByText(/new/)).toBeInTheDocument();

    const oldContent = dialog.getByText(/found:/i);
    expect(oldContent).toBeInTheDocument();
    expect(within(oldContent).getByText(/1/)).toBeInTheDocument();
    expect(within(oldContent).getByText(/existed/)).toBeInTheDocument();

    const table = dialog.getByRole("table");
    const data = duplicate.sample[0];
    expect(
      within(table).getByRole("row", {
        name: `id: ${data.id}`,
      }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("row", {
        name: Object.values(data.old).join(" "),
      }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("row", {
        name: Object.values(data.new).join(" "),
      }),
    ).toBeInTheDocument();
  });
});
