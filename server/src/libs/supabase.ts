import { createClient } from "@supabase/supabase-js";
import { CsvData } from "../types";
import { CsvJobData } from "../worker/queue";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
);

export const getExisting = (ids: number[]) =>
  supabase.from("csv_now").select("*").in("id", ids);

export const insertBatch = async (
  rows: CsvData[],
  option: CsvJobData["option"],
) => {
  const ignoreDuplicates = option === "ignore" ? true : undefined;
  return await supabase
    .from("csv_now")
    .upsert(rows, { onConflict: "id", ignoreDuplicates });
};

export const getRecords = async (from: number, to: number, filter?: string) => {
  if (!filter) {
    return await supabase
      .from("csv_now")
      .select("*", { count: "planned" })
      .range(from, to);
  } else {
    return await getRecordsWithFilter(from, to, filter);
  }
};

export const getRecordsWithFilter = async (
  from: number,
  to: number,
  filter: string,
) => {
  const columns = ["name", "email", "body"];
  const keyword = filter.replace(/[^a-zA-Z0-9 @.-]/g, "");
  const query = columns.join(`.ilike.*${keyword}*,`) + `.ilike.*${keyword}*`;
  console.log(query);
  return await supabase
    .from("csv_now")
    .select("*", { count: "exact" })
    .or(query)
    .range(from, to);
};

const CHUNK_SIZE = 10_000;
export const batchSelect = async (ids: number[]): Promise<CsvData[]> => {
  const dataInDb: CsvData[] = [];
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const { data } = await getExisting(chunk);
    dataInDb.push(...(data ?? []));
  }
  return dataInDb;
};
