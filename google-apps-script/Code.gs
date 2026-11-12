// Paste this entire script into Extensions -> Apps Script inside your Google Sheet:
// https://docs.google.com/spreadsheets/d/1AlQJGqD7ACIrh-ygRWCxltOtVeNmEdhzucLWW04KWWI/edit
// Then click Deploy -> New deployment -> Web app -> Execute as: Me -> Who has access: Anyone -> Deploy.
// Copy the Web App URL (ending in /exec) into VITE_GSHEETS_WEBHOOK_URL.

const SPREADSHEET_ID = "1AlQJGqD7ACIrh-ygRWCxltOtVeNmEdhzucLWW04KWWI";
const SHEET_NAME = "RSVPs";
const HEADERS = ["Timestamp", "Name", "Phone", "Guests", "Attending", "Note"];

function getTargetSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0] || ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const raw =
      e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const data = JSON.parse(raw);

    const name = String(data.name || "").trim();
    const phone = String(data.phone || "").trim();
    const guests = Math.min(10, Math.max(1, Number(data.guests) || 1));
    const attending = data.attending === true || data.attending === "yes" ? "Yes" : "No";
    const note = String(data.note || "").trim();

    if (name.length < 2 || phone.length < 8) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "Invalid name or phone" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const timestamp = Utilities.formatDate(
      new Date(),
      "Asia/Kolkata",
      "dd-MMM-yyyy hh:mm:ss a"
    );

    const sheet = getTargetSheet_();
    sheet.appendRow([timestamp, name, "'" + phone, guests, attending, note]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: "Wedding RSVP Google Sheets Webhook" })
  ).setMimeType(ContentService.MimeType.JSON);
}
