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
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((r) => r.text).join("");
  }
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text;
  }
  if (typeof value === "object" && "result" in value) {
    const r = (value as { result?: unknown }).result;
    return r === undefined || r === null ? null : String(r);
  }
  return null;
}
