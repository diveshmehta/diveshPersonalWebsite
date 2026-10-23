// Receives questionnaire.html submissions and call-back requests from the home page pop-up,
// and adds one row per submission to this spreadsheet.
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

// Call-back requests from the pop-up on index.html go to their own tab.
var CALLBACK_SHEET = 'Call-backs';
var CALLBACK_COLUMNS = [
  ['submitted_at', 'Submitted at'],
  ['name', 'Name'],
  ['phone', 'Phone'],
  ['best_time', 'Best time to call'],
  ['message', 'Message'],
  ['trigger', 'How the pop-up opened'],
  ['page', 'Page']
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var p = (e && e.parameter) || {};
    if (p.website) return ok_(); // hidden spam-trap field
    var callback = p.form === 'callback';
    var columns = callback ? CALLBACK_COLUMNS : COLUMNS;
    var sheet = sheet_(callback ? CALLBACK_SHEET : SHEET_NAME, columns);
    var row = columns.map(function (c) {
      if (c[0] === 'submitted_at') return new Date();
      return safe_(String(p[c[0]] || '').slice(0, 2000));
    });
    sheet.appendRow(row);
    if (callback) notify_(p);
    return ok_();
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Questionnaire endpoint is running.');
}

function sheet_(name, columns) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(columns.map(function (c) { return c[1]; }));
    sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Emails you each call-back request so you can ring them while they're still interested.
function notify_(p) {
  try {
    var body = 'Name: ' + (p.name || '') + '\nPhone: ' + (p.phone || '') + '\nBest time: ' + (p.best_time || '') +
      '\nMessage: ' + (p.message || '') + '\n\nWhatsApp them: https://wa.me/' + String(p.phone || '').replace(/\D/g, '').replace(/^(\d{10})$/, '91$1');
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Call-back request: ' + (p.name || 'new visitor'), body);
  } catch (err) {
    // The row is already saved; a failed email shouldn't lose the request.
  }
}

// Stops Sheets from reading "+91..." as a number or any answer as a formula.
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
