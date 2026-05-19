import { google, sheets_v4 } from "googleapis";
import { config } from "../config.js";

export type ClockAction = "CLOCKIN" | "CLOCKOUT";

let cached: sheets_v4.Sheets | null = null;

function getClient(): sheets_v4.Sheets {
  if (cached) return cached;
  const auth = new google.auth.GoogleAuth({
    keyFile: config.GOOGLE_SERVICE_ACCOUNT_JSON,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  cached = google.sheets({ version: "v4", auth });
  return cached;
}

function quote(sheetName: string): string {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

export async function ensureSheet(sheetName: string): Promise<void> {
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
    fields: "sheets.properties.title",
  });

  const exists = meta.data.sheets?.some(
    (s) => s.properties?.title === sheetName
  );
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
    requestBody: {
      requests: [{ addSheet: { properties: { title: sheetName } } }],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: `${quote(sheetName)}!A1:C1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [["Fecha", "Hora", "Acción"]] },
  });
}

export async function getLastAction(
  sheetName: string
): Promise<ClockAction | null> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: `${quote(sheetName)}!C2:C`,
  });
  const values = res.data.values;
  if (!values || values.length === 0) return null;

  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i]?.[0];
    if (v === "CLOCKIN" || v === "CLOCKOUT") return v;
  }
  return null;
}

export async function appendRow(
  sheetName: string,
  row: [string, string, ClockAction]
): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: `${quote(sheetName)}!A:C`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}
