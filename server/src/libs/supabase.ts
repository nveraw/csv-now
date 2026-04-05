import { createClient } from "@supabase/supabase-js";
import { CsvJobData } from "../queue";
import { CsvData } from "../types";

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
  const query = columns.join(`.ilike.*${filter}*,`) + `.ilike.*${filter}*`;
  console.log(query);
  return await supabase
    .from("csv_now")
    .select("*", { count: "planned" })
    .or(query)
    .range(from, to);
};
