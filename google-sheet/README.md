# Questionnaire → Google Sheet

`questionnaire.html` posts each submission to a Google Apps Script web app, which adds a row to your Google Sheet. One-time setup, about 5 minutes:

1. Create a new Google Sheet (for example "Client questionnaire responses").
2. In the sheet, open **Extensions > Apps Script**. Delete the sample code, paste in everything from `Code.gs`, and click **Save**.
3. Click **Deploy > New deployment**. Choose type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** and allow the permissions Google asks for.
4. Copy the **Web app URL** (it ends in `/exec`).
5. In `questionnaire.html`, paste it into `var SHEET_URL='';` near the bottom of the file, then commit.

The script creates a **Responses** tab with headers on the first submission. Every row includes a risk score (4 to 16) and profile computed from the four risk questions:

| Score | Profile |
| --- | --- |
| 4-6 | Conservative |
| 7-9 | Moderately conservative |
| 10-12 | Moderate |
| 13-14 | Moderately aggressive |
| 15-16 | Aggressive |

Until `SHEET_URL` is set, the form offers to send the answers on WhatsApp instead.

If you later edit `Code.gs`, use **Deploy > Manage deployments > Edit > New version** so the URL stays the same.

## Call-back pop-up

The home page has a "Prefer a call back?" pop-up that posts to the same web app with `form=callback`. The updated `Code.gs` saves those to a separate **Call-backs** tab (name, phone, best time, message) and emails you each one.

To switch it on, paste the new `Code.gs` into Apps Script, then use **Deploy > Manage deployments > Edit > New version > Deploy**, and allow the new email permission Google asks for. The URL stays the same, so no site change is needed.

Until you do, call-back requests still arrive, as rows in the **Responses** tab with the name, phone, and best time in the Notes column.
