export const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1AlQJGqD7ACIrh-ygRWCxltOtVeNmEdhzucLWW04KWWI/edit?usp=sharing";

const webhookUrl = (import.meta.env.VITE_GSHEETS_WEBHOOK_URL || "").trim();

export const hasGoogleSheetsConfig = Boolean(webhookUrl);

export async function submitRsvpToGoogleSheets(payload) {
  if (!webhookUrl) {
    throw new Error("Google Sheets webhook URL is not configured.");
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Google Sheets request failed (${res.status})`);
  }

  const data = await res.json();
  if (!data?.ok) {
    throw new Error(data?.error || "Could not save RSVP to Google Sheets.");
  }
  return data;
}
