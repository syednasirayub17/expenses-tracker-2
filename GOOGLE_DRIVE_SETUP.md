# 🔑 Google Drive Backup Setup - Step by Step

## Problem
Getting "Invalid JWT Signature" error when trying to upload backups to Google Drive.

## Solution
Generate a new service account key.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Service Accounts Page

You should already have this page open:
https://console.cloud.google.com/iam-admin/serviceaccounts?project=expenses-tracker-478817

If not, click the link above.

---

### Step 2: Click on Service Account

On the Service Accounts page, click on:
```
expenses-tracker-service@expenses-tracker-478817.iam.gserviceaccount.com
```

This will open the service account details page.

---

### Step 3: Go to Keys Tab

At the top of the service account details page, you'll see several tabs:
- DETAILS
- PERMISSIONS
- **KEYS** ← Click this one
- METRICS
- LOGS

Click on the **KEYS** tab.

---

### Step 4: Add New Key

1. Click the **"ADD KEY"** button (blue button)
2. From the dropdown, select **"Create new key"**

---

### Step 5: Choose JSON Format

A dialog will appear asking for the key type:
- ○ P12
- ● JSON ← Select this one

Click the **"CREATE"** button.

---

### Step 6: Download Confirmation

A JSON file will automatically download to your Downloads folder.

The filename will be something like:
```
expenses-tracker-478817-c3b2c87594080a73525a091f67732ac4dc724892.json
```

**Important:** Don't close the browser yet - you'll see a confirmation message.

---

### Step 7: Replace credentials.json

Open your terminal and run these commands:

```bash
# Navigate to server directory
cd /Users/nasir/Documents/project/expenses-tracker/server

# Backup old credentials (optional but recommended)
cp credentials.json credentials.json.backup

# Copy the new key file (replace the * with your actual filename)
cp ~/Downloads/expenses-tracker-478817-*.json credentials.json
```

**Alternative (Manual Method):**
1. Open the downloaded JSON file in a text editor
2. Copy all the contents (Cmd+A, Cmd+C)
3. Open `server/credentials.json` in your editor
4. Replace all contents with the copied JSON (Cmd+A, Cmd+V)
5. Save the file (Cmd+S)

---

### Step 8: Test the New Credentials

Run the diagnostic test:

```bash
cd /Users/nasir/Documents/project/expenses-tracker/server
node test-drive-auth.js
```

**Expected Output (Success):**
```
🔍 Diagnosing Google Drive API Connection...

✅ Credentials file loaded
   Service Account: expenses-tracker-service@expenses-tracker-478817.iam.gserviceaccount.com
   Project ID: expenses-tracker-478817

🕐 System Time Check:
   Local Time: 2025-11-29T14:35:00.000Z
   Timestamp: 1764426900

🔐 Testing Authentication...

   Requesting access token...
   ✅ Access token obtained successfully!

📁 Testing Google Drive API...

   ✅ Google Drive API is working!

✅ All checks passed! Your Google Drive integration is ready.
```

**If you still see errors:** The credentials file might not have been replaced correctly. Double-check Step 7.

---

### Step 9: Run Full Backup

Once the test passes, run the full backup:

```bash
npm run backup:full
```

**Expected Output:**
```
🚀 Starting MongoDB backup...
✅ Connected to MongoDB
...
✅ Backup completed successfully!

🚀 Starting Google Drive upload...
📦 Latest backup: backup-2025-11-29T14-35-00.zip
✅ Found existing "MongoDB Backups" folder
📁 Creating folder: 2025-11

📤 Uploading: backup-2025-11-29T14-35-00.zip (1.9 KB)
✅ Uploaded successfully!
   File ID: 1abc...xyz
   View: https://drive.google.com/file/d/1abc...xyz/view

✅ Upload completed successfully!
```

---

### Step 10: Verify in Google Drive

1. Go to https://drive.google.com
2. Look for a folder called **"MongoDB Backups"**
3. Inside, you should see a folder for the current month (e.g., **"2025-11"**)
4. Inside that, you should see your backup ZIP file

---

## ✅ Success!

Your Google Drive backup is now working! You can now use:

- `npm run backup:drive` - Upload latest backup to Google Drive
- `npm run backup:full` - Create backup + upload in one command
- `./automated-backup.sh --drive` - Automated backup with Drive upload

---

## 🔧 Troubleshooting

### Issue: "No such file or directory" when copying

**Solution:**
```bash
# List downloaded files to find exact name
ls -la ~/Downloads/expenses-tracker-*.json

# Copy using the exact filename shown
cp ~/Downloads/expenses-tracker-478817-EXACT-FILENAME.json /Users/nasir/Documents/project/expenses-tracker/server/credentials.json
```

### Issue: Test still fails after replacing credentials

**Solution:**
1. Verify the file was actually replaced:
   ```bash
   cat /Users/nasir/Documents/project/expenses-tracker/server/credentials.json
   ```
2. Check that it shows the new `private_key_id` (different from old one)
3. Make sure the file is valid JSON (no extra characters)

### Issue: Can't find downloaded file

**Solution:**
1. Check your Downloads folder in Finder
2. Look for files starting with `expenses-tracker-478817-`
3. The file should have been downloaded in the last few minutes

---

## 📞 Need Help?

If you're still having issues after following these steps:
1. Take a screenshot of the error
2. Check that Google Drive API is enabled (it should be ✅)
3. Verify system time is correct: `date`

---

**Last Updated:** November 29, 2025
