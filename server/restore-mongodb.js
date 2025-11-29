const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, 'backups');

// Collection names to restore
const collectionNames = [
    'users',
    'bankaccounts',
    'creditcards',
    'loans',
    'transactions',
    'budgets',
    'daybooks',
    'journals',
    'stocks',
    'sips'
];

// Get backup folder from command line argument
const backupFolderName = process.argv[2];

if (!backupFolderName) {
    console.error('❌ Error: Please provide backup folder name');
    console.log('\nUsage: node restore-mongodb.js <backup-folder-name>');
    console.log('Example: node restore-mongodb.js backup-2025-11-29T19-40-00\n');

    // List available backups
    if (fs.existsSync(BACKUP_DIR)) {
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('backup-') && !f.endsWith('.zip'))
            .sort()
            .reverse();

        if (backups.length > 0) {
            console.log('Available backups:');
            backups.forEach(b => console.log(`  - ${b}`));
        } else {
            console.log('No backups found in:', BACKUP_DIR);
        }
    }
    process.exit(1);
}

const backupFolder = path.join(BACKUP_DIR, backupFolderName);

// Validate backup folder exists
if (!fs.existsSync(backupFolder)) {
    console.error(`❌ Error: Backup folder not found: ${backupFolder}`);
    process.exit(1);
}

// Restore function
async function restoreDatabase() {
    try {
        console.log('🚀 Starting MongoDB restore...\n');
        console.log(`📁 Restore from: ${backupFolder}\n`);

        // Check metadata
        const metadataPath = path.join(backupFolder, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            console.log('📊 Backup Information:');
            console.log(`   Date: ${metadata.date}`);
            console.log(`   Total Documents: ${metadata.totalDocuments}`);
            console.log(`   Collections: ${metadata.collections.length}\n`);
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Warning prompt
        console.log('⚠️  WARNING: This will DELETE all existing data and restore from backup!');
        console.log('⚠️  Press Ctrl+C within 5 seconds to cancel...\n');

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Restore each collection
        let totalDocuments = 0;
        for (const collectionName of collectionNames) {
            try {
                const filePath = path.join(backupFolder, `${collectionName}.json`);

                if (!fs.existsSync(filePath)) {
                    console.log(`⚠️  ${collectionName.padEnd(20)} - File not found, skipping`);
                    continue;
                }

                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const collection = db.collection(collectionName);

                // Clear existing data
                await collection.deleteMany({});

                // Insert backup data
                if (data.length > 0) {
                    await collection.insertMany(data);
                }

                console.log(`✅ ${collectionName.padEnd(20)} - ${data.length} documents restored`);
                totalDocuments += data.length;
            } catch (error) {
                console.log(`❌ ${collectionName.padEnd(20)} - Error: ${error.message}`);
            }
        }

        console.log(`\n📊 Total documents restored: ${totalDocuments}\n`);
        console.log('✅ Restore completed successfully!\n');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Restore failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run restore
restoreDatabase();
