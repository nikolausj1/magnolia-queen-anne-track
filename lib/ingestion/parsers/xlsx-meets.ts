import ExcelJS from "exceljs";

export type ParsedSheet = {
  sheetName: string;
  headers: string[];
  rows: (string | null)[][];
};

export async function parseMeetsXlsx(path: string): Promise<ParsedSheet[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);

  const sheets: ParsedSheet[] = [];
  workbook.eachSheet((worksheet) => {
    const headers: string[] = [];
    const rows: (string | null)[][] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const cellValues: (string | null)[] = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cellValues[colNumber - 1] = cellToString(cell.value);
      });
      if (rowNumber === 1) {
        for (const v of cellValues) headers.push(v ?? "");
      } else {
        rows.push(cellValues);
      }
    });

    sheets.push({ sheetName: worksheet.name, headers, rows });
  });

  return sheets;
}

function cellToString(value: ExcelJS.CellValue): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (value instanceof Date) return formatExcelDate(value);
  if (typeof value === "object" && "richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((r) => r.text).join("");
  }
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text;
  }
  if (typeof value === "object" && "result" in value) {
    const r = (value as { result?: unknown }).result;
    if (r === undefined || r === null) return null;
    if (r instanceof Date) return formatExcelDate(r);
    return String(r);
  }
  return null;
}

// Excel time-only cells come back as Dates anchored to Excel's epoch
// (1899-12-30 / 1899-12-31 / 1900-01-01 depending on the file). Track
// marks in this dataset are minutes:seconds — when the user types "6:26"
// Excel parses it as h:m (06:26:00). Reinterpret as m:ss so it
// round-trips through parseTime.
function formatExcelDate(d: Date): string {
  const year = d.getUTCFullYear();
  if (year !== 1899 && year !== 1900) return d.toISOString();
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const s = d.getUTCSeconds();
  // If hours > 0, Excel saw "M:SS" as "H:M" — recover by shifting.
  const minutes = h > 0 ? h : m;
  const seconds = h > 0 ? m : s;
  if (minutes === 0) return `:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
