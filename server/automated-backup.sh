#!/bin/bash

# MongoDB Automated Backup Script
# This script creates a backup and cleans up old backups (keeps last 7 days)
# Optional: Upload to Google Drive with --drive flag

echo "🚀 Starting automated MongoDB backup..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKUP_DIR="$SCRIPT_DIR/backups"

# Run the backup script
cd "$SCRIPT_DIR"
node backup-mongodb.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backup completed successfully!"
    echo ""
    
    # Check if --drive flag is provided
    if [ "$1" = "--drive" ]; then
        echo "☁️  Uploading to Google Drive..."
        node backup-to-drive.js
        
        if [ $? -eq 0 ]; then
            echo "✅ Google Drive upload completed!"
        else
            echo "⚠️  Google Drive upload failed (backup still saved locally)"
        fi
        echo ""
    fi
    
    # Clean up old backups (keep last 7 days)
    echo "🧹 Cleaning up old backups (keeping last 7 days)..."
    
    # Find and delete backup folders older than 7 days
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup-*" -mtime +7 -exec rm -rf {} \;
    
    # Find and delete ZIP files older than 7 days
    find "$BACKUP_DIR" -maxdepth 1 -type f -name "backup-*.zip" -mtime +7 -exec rm -f {} \;
    
    echo "✅ Cleanup completed!"
    echo ""
    
    # Show current backups
    echo "📁 Current backups:"
    ls -lh "$BACKUP_DIR" | grep "backup-" | awk '{print "   " $9 " (" $5 ")"}'
    echo ""
else
    echo ""
    echo "❌ Backup failed!"
    exit 1
fi
