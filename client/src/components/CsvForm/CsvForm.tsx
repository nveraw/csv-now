import { useState, type ChangeEvent, type SubmitEvent } from "react";

export default function CsvForm() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;
    setFile(newFile);
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:3001/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept=".csv" onChange={handleUpload} />
      <button type="submit">Upload CSV</button>
    </form>
  );
}
