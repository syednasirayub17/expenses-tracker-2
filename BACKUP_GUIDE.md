# 🔐 MongoDB Backup Guide

## ⚠️ Important Information

> [!WARNING]
> **MongoDB Atlas M0 (Free Tier) does NOT include automatic backups!**
> 
> Your data is at risk without regular backups. This guide shows you how to backup and restore your MongoDB database.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Manual Backup](#manual-backup)
3. [Automated Backup](#automated-backup)
4. [Restore from Backup](#restore-from-backup)
5. [Backup to Google Drive](#backup-to-google-drive)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure you're in the server directory
cd server

# Install dependencies (if not already done)
npm install
```

### Create Your First Backup
```bash
npm run backup
```

That's it! Your backup will be created in `server/backups/`.

---

## 💾 Manual Backup

### Run Manual Backup
```bash
cd server
npm run backup
```

### What Gets Backed Up?
All collections in your database:
- ✅ Users
- ✅ Bank Accounts
- ✅ Credit Cards
- ✅ Loans
- ✅ Transactions
- ✅ Budgets
- ✅ Day Books
- ✅ Journals
- ✅ Stocks
- ✅ SIPs

### Backup Output
```
server/backups/
├── backup-2025-11-29T19-40-00/
│   ├── users.json
│   ├── bankaccounts.json
│   ├── creditcards.json
│   ├── loans.json
│   ├── transactions.json
│   ├── budgets.json
│   ├── daybooks.json
│   ├── journals.json
│   ├── stocks.json
│   ├── sips.json
│   └── metadata.json
└── backup-2025-11-29T19-40-00.zip  ← Compressed backup
```

### Backup Information
- **Format**: JSON files (human-readable)
- **Compression**: ZIP archive created automatically
- **Metadata**: Includes timestamp, document count, collection list
- **Size**: Typically 1-10 MB depending on data

---

## ⏰ Automated Backup

### Setup Automated Daily Backups

#### Option 1: Using Cron (Mac/Linux)

**1. Open crontab editor:**
```bash
crontab -e
```

**2. Add this line for daily backup at 2 AM:**
```bash
0 2 * * * cd /Users/nasir/Documents/project/expenses-tracker/server && npm run backup:auto >> /tmp/mongodb-backup.log 2>&1
```

**3. Save and exit** (Press `Esc`, type `:wq`, press `Enter`)

**4. Verify cron job:**
```bash
crontab -l
```

#### Option 2: Manual Automated Backup
```bash
cd server
npm run backup:auto
```

This will:
- ✅ Create a new backup
- ✅ Delete backups older than 7 days
- ✅ Show current backups

### Backup Retention Policy
- **Keeps**: Last 7 days of backups
- **Deletes**: Backups older than 7 days automatically
- **Storage**: Approximately 7-70 MB (depending on data size)

---

## 🔄 Restore from Backup

### List Available Backups
```bash
cd server
ls -lh backups/
```

### Restore from Backup

> [!CAUTION]
> **Restoring will DELETE all current data and replace it with backup data!**
> 
> Make sure you have a recent backup before restoring.

**1. Choose a backup folder:**
```bash
# List backups
ls backups/ | grep backup-

# Example output:
# backup-2025-11-29T19-40-00
# backup-2025-11-28T19-40-00
```

**2. Run restore:**
```bash
npm run restore backup-2025-11-29T19-40-00
```

**3. Wait for confirmation:**
```
⚠️  WARNING: This will DELETE all existing data and restore from backup!
⚠️  Press Ctrl+C within 5 seconds to cancel...
```

**4. Restore completes:**
```
✅ users               - 5 documents restored
✅ bankaccounts        - 3 documents restored
✅ transactions        - 150 documents restored
...
📊 Total documents restored: 200
✅ Restore completed successfully!
```

---

## ☁️ Backup to Google Drive

### Prerequisites

**1. Enable Google Drive API:**
1. Go to: https://console.cloud.google.com/apis/library/drive.googleapis.com?project=expenses-tracker-478817
2. Click **"Enable"**

**2. Verify Credentials:**
- Ensure `server/credentials.json` exists (already configured ✅)

### Manual Upload to Google Drive

**Upload latest backup:**
```bash
cd server
npm run backup:drive
```

This will:
- ✅ Find your latest backup ZIP file
- ✅ Create "MongoDB Backups" folder in Google Drive (if needed)
- ✅ Create month folder (e.g., "2025-11")
- ✅ Upload the backup
- ✅ Provide Google Drive link

**Output:**
```
🚀 Starting Google Drive upload...

📦 Latest backup: backup-2025-11-29T14-14-41.zip
✅ Found existing "MongoDB Backups" folder
📁 Creating folder: 2025-11

📤 Uploading: backup-2025-11-29T14-14-41.zip (1.9 KB)
✅ Uploaded successfully!
   File ID: 1abc...xyz
   View: https://drive.google.com/file/d/1abc...xyz/view

✅ Upload completed successfully!

📁 Google Drive Structure:
   MongoDB Backups/
   └── 2025-11/
       └── backup-2025-11-29T14-14-41.zip

🔗 Access your backups at: https://drive.google.com
```

### Full Backup (Local + Google Drive)

**Create backup and upload in one command:**
```bash
cd server
npm run backup:full
```

This runs:
1. `npm run backup` - Creates local backup
2. `npm run backup:drive` - Uploads to Google Drive

### Automated Google Drive Backup

**Option 1: Automated Script with Drive Upload**
```bash
cd server
./automated-backup.sh --drive
```

This will:
- Create backup
- Upload to Google Drive
- Clean up old local backups (7 days)

**Option 2: Cron Job with Google Drive**
```bash
# Edit crontab
crontab -e

# Daily backup + Google Drive upload at 2 AM
0 2 * * * cd /Users/nasir/Documents/project/expenses-tracker/server && ./automated-backup.sh --drive >> /tmp/mongodb-backup.log 2>&1
```

### Google Drive Folder Structure

Your backups are organized by month:
```
Google Drive/
└── MongoDB Backups/
    ├── 2025-11/
    │   ├── backup-2025-11-29T14-14-41.zip
    │   ├── backup-2025-11-28T14-14-41.zip
    │   └── backup-2025-11-27T14-14-41.zip
    └── 2025-12/
        └── backup-2025-12-01T14-14-41.zip
```

### Access Your Backups

**View in Google Drive:**
1. Go to https://drive.google.com
2. Look for "MongoDB Backups" folder
3. Navigate to the month folder
4. Download any backup ZIP file

**Service Account Access:**
- Backups are owned by the service account
- You can share the folder with your personal Google account for easier access

### Troubleshooting Google Drive Upload

**Error: "insufficient authentication scopes"**
```
⚠️  Google Drive API may not be enabled.
Enable it at: https://console.cloud.google.com/apis/library/drive.googleapis.com
```

**Solution:**
1. Click the link provided
2. Click "Enable" button
3. Wait 1-2 minutes for activation
4. Try upload again

**Error: "credentials.json not found"**
```
❌ Error: credentials.json not found
```

**Solution:**
- Ensure `server/credentials.json` exists
- Check file permissions

**Error: "No backup ZIP files found"**
```
❌ Error: No backup ZIP files found
Run "npm run backup" first to create a backup
```

**Solution:**
```bash
npm run backup
npm run backup:drive
```

---

## 🔧 Troubleshooting

### Backup Fails - Connection Error
```
❌ Error: connect ECONNREFUSED
```

**Solution:**
- Check MongoDB connection string in `.env`
- Verify MongoDB Atlas cluster is running
- Check internet connection

### Backup Fails - Authentication Error
```
❌ Error: Authentication failed
```

**Solution:**
- Verify `MONGODB_URI` in `server/.env`
- Check username and password are correct
- Ensure database user has read permissions

### Restore Fails - Backup Not Found
```
❌ Error: Backup folder not found
```

**Solution:**
```bash
# List available backups
ls server/backups/

# Use exact folder name
npm run restore backup-2025-11-29T19-40-00
```

### Out of Disk Space
```
❌ Error: ENOSPC: no space left on device
```

**Solution:**
```bash
# Clean up old backups manually
cd server/backups
rm -rf backup-2025-11-20*

# Or run automated cleanup
npm run backup:auto
```

### Permission Denied (Shell Script)
```
❌ Error: Permission denied: ./automated-backup.sh
```

**Solution:**
```bash
chmod +x server/automated-backup.sh
```

---

## 📊 Backup Best Practices

### Recommended Schedule

| Frequency | Method | Retention |
|-----------|--------|-----------|
| **Daily** | Automated (cron) | 7 days |
| **Weekly** | Manual to Google Drive | 4 weeks |
| **Monthly** | Manual to external drive | 12 months |

### Critical Backups
Before making major changes:
```bash
# Create backup before:
# - Database migrations
# - Bulk data operations
# - Schema changes
# - Production deployments

npm run backup
```

### Verify Backups
Periodically test restore process:
```bash
# 1. Create test backup
npm run backup

# 2. Note current data count
# 3. Restore from backup
npm run restore backup-YYYY-MM-DDTHH-MM-SS

# 4. Verify data integrity
```

---

## 🎯 Quick Reference

### Backup Commands
```bash
# Manual backup
npm run backup

# Automated backup (with cleanup)
npm run backup:auto

# List backups
ls -lh server/backups/
```

### Restore Commands
```bash
# List available backups
npm run restore

# Restore specific backup
npm run restore backup-2025-11-29T19-40-00
```

### Cron Schedule Examples
```bash
# Every day at 2 AM
0 2 * * * cd /path/to/server && npm run backup:auto

# Every 6 hours
0 */6 * * * cd /path/to/server && npm run backup

# Every Sunday at 3 AM
0 3 * * 0 cd /path/to/server && npm run backup
```

---

## 🔒 Security Notes

> [!IMPORTANT]
> **Backup Security:**
> - Backups contain sensitive user data
> - Store backups in secure locations
> - Encrypt backups before cloud storage
> - Never commit backups to Git
> - Add `backups/` to `.gitignore`

### Encryption (Optional)
```bash
# Encrypt backup
zip -e backup-encrypted.zip backup-2025-11-29T19-40-00.zip
# Enter password when prompted

# Decrypt backup
unzip backup-encrypted.zip
```

---

## 📈 Monitoring Backup Health

### Check Backup Size
```bash
du -sh server/backups/*
```

### Check Backup Age
```bash
ls -lht server/backups/ | head -5
```

### Verify Backup Integrity
```bash
# Test ZIP file
unzip -t server/backups/backup-2025-11-29T19-40-00.zip
```

---

## 🆘 Emergency Recovery

### If Database is Deleted
1. **Don't panic!**
2. Find latest backup: `ls -lt server/backups/`
3. Restore: `npm run restore backup-LATEST`
4. Verify data integrity
5. Resume operations

### If Backup is Corrupted
1. Try previous backup
2. Check Google Drive backups
3. Contact MongoDB Atlas support (if applicable)

---

## 📞 Support

For backup issues:
1. Check this guide
2. Verify `.env` configuration
3. Check MongoDB Atlas dashboard
4. Review backup logs: `/tmp/mongodb-backup.log`

---

**Last Updated**: November 29, 2025  
**Version**: 1.0.0

---

> [!TIP]
> **Pro Tip**: Set a calendar reminder to verify backups monthly. A backup is only good if you can restore from it!
