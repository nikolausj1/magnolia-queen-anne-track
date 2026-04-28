import ExcelJS from "exceljs";

const path = "inbox/2026 TRACK TIMES & DISTANCES.xlsx";
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(path);
const ws = wb.getWorksheet("2ND MEET APRIL 25");
if (!ws) { console.error("missing sheet"); process.exit(1); }

const header = ws.getRow(1);
let javelinCol = -1;
let nameCol = -1;
header.eachCell((cell, col) => {
  const v = (cell.value ?? "").toString().trim().toUpperCase();
  if (v === "JAVELIN") javelinCol = col;
  if (v === "NAME" || v === "ATHLETE") nameCol = col;
});
if (javelinCol === -1 || nameCol === -1) {
  console.error(`headers: name=${nameCol} javelin=${javelinCol}`);
  process.exit(1);
}

let chaseRow = -1;
for (let i = 2; i <= ws.rowCount; i++) {
  const v = (ws.getRow(i).getCell(nameCol).value ?? "").toString().trim().toUpperCase();
  if (v === "CHASE N." || v === "CHASE N" || v === "CHASE") {
    chaseRow = i;
    console.error(`Found Chase at row ${i} as "${v}"`);
    break;
  }
}
if (chaseRow === -1) { console.error("Chase row not found"); process.exit(1); }

const cell = ws.getRow(chaseRow).getCell(javelinCol);
const before = cell.value;
cell.value = `43'3"`;
console.error(`Set ${ws.name} row ${chaseRow} col ${javelinCol} (Javelin): "${before ?? ""}" -> 43'3"`);

await wb.xlsx.writeFile(path);
console.error("saved xlsx");
