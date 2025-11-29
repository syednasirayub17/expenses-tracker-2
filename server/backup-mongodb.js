const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, 'backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Get timestamp for backup folder
const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace(/:/g, '-').split('.')[0];
};

// Collection names to backup
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

// Backup function
async function backupDatabase() {
    try {
        console.log('🚀 Starting MongoDB backup...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Create timestamped backup folder
        const timestamp = getTimestamp();
        const backupFolder = path.join(BACKUP_DIR, `backup-${timestamp}`);
        fs.mkdirSync(backupFolder, { recursive: true });

        console.log(`📁 Backup folder: ${backupFolder}\n`);

        // Backup each collection
        let totalDocuments = 0;
        for (const collectionName of collectionNames) {
            try {
                // Check if collection exists
                const collections = await db.listCollections({ name: collectionName }).toArray();

                if (collections.length === 0) {
                    console.log(`⚠️  ${collectionName.padEnd(20)} - Collection not found, skipping`);
                    continue;
                }

                const collection = db.collection(collectionName);
                const data = await collection.find({}).toArray();
                const filePath = path.join(backupFolder, `${collectionName}.json`);

                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

                console.log(`✅ ${collectionName.padEnd(20)} - ${data.length} documents`);
                totalDocuments += data.length;
            } catch (error) {
                console.log(`⚠️  ${collectionName.padEnd(20)} - Error: ${error.message}`);
            }
        }

        console.log(`\n📊 Total documents backed up: ${totalDocuments}\n`);

        // Create ZIP archive
        console.log('📦 Creating ZIP archive...');
        const zipPath = `${backupFolder}.zip`;
        await createZipArchive(backupFolder, zipPath);

        console.log(`✅ ZIP created: ${zipPath}\n`);

        // Create backup metadata
        const metadata = {
            timestamp,
            date: new Date().toISOString(),
            totalDocuments,
            collections: collectionNames,
            mongodbUri: process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') // Hide password
        };

        fs.writeFileSync(
            path.join(backupFolder, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        console.log('✅ Backup completed successfully!\n');
        console.log(`📍 Backup location: ${backupFolder}`);
        console.log(`📍 ZIP location: ${zipPath}\n`);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Backup failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Create ZIP archive
function createZipArchive(sourceDir, outPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

// Run backup
backupDatabase();
