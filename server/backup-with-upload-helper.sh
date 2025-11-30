#!/bin/bash

# MongoDB Backup with Manual Google Drive Upload Helper
# This script creates a backup and helps you upload it to Google Drive

echo "🚀 Starting MongoDB backup..."
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
    
    # Get latest backup ZIP
    LATEST_ZIP=$(ls -t "$BACKUP_DIR"/*.zip | head -1)
    LATEST_NAME=$(basename "$LATEST_ZIP")
    
    echo "📦 Latest backup: $LATEST_NAME"
    echo "📍 Location: $LATEST_ZIP"
    echo ""
    
    # Open backup folder in Finder
    echo "📁 Opening backup folder in Finder..."
    open "$BACKUP_DIR"
    
    echo ""
    echo "📤 To upload to Google Drive:"
    echo "   1. The backup folder is now open in Finder"
    echo "   2. Go to https://drive.google.com/drive/folders/1l8X3mb5ZGTY0ELIFgMblB0tg5TdPpG5A"
    echo "   3. Drag and drop the ZIP file: $LATEST_NAME"
    echo ""
    echo "   Or use this command to copy to clipboard:"
    echo "   cp \"$LATEST_ZIP\" ~/Desktop/"
    echo ""
    
else
    echo ""
    echo "❌ Backup failed!"
    exit 1
fi
