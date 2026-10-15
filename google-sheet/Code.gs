// Receives questionnaire.html submissions and adds one row per submission to this spreadsheet.
// Paste into Extensions > Apps Script of the Google Sheet, then deploy as a web app (see README.md).

var SHEET_NAME = 'Responses';
var COLUMNS = [
  ['submitted_at', 'Submitted at'],
  ['phone', 'Phone'],
  ['name', 'Name'],
  ['email', 'Email'],
  ['age', 'Age'],
  ['dependents', 'Dependents'],
  ['occupation', 'Occupation'],
  ['income', 'Household take-home per month'],
  ['invest_monthly', 'Can invest per month'],
  ['emergency', 'Emergency cover'],
  ['insurance', 'Insurance'],
  ['costly_debt', 'Loans above 12%'],
  ['holdings', 'Current holdings'],
  ['sip_monthly', 'Running SIPs per month'],
  ['goals', 'Goals'],
  ['goal_details', 'Top goal'],
  ['risk_fall', 'If portfolio falls 20%'],
  ['risk_drop', 'Largest fall tolerated'],
  ['risk_horizon', 'Investment horizon'],
  ['risk_experience', 'Equity experience'],
  ['risk_score', 'Risk score (4-16)'],
  ['risk_profile', 'Risk profile'],
  ['notes', 'Notes'],
  ['page', 'Page']
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var p = (e && e.parameter) || {};
    if (p.website) return ok_(); // hidden spam-trap field
    var sheet = sheet_();
    var row = COLUMNS.map(function (c) {
      if (c[0] === 'submitted_at') return new Date();
      return safe_(String(p[c[0]] || '').slice(0, 2000));
    });
    sheet.appendRow(row);
    return ok_();
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Questionnaire endpoint is running.');
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(function (c) { return c[1]; }));
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Stops Sheets from reading "+91..." as a number or any answer as a formula.
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
