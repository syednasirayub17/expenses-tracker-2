const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, 'backups');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Load credentials
let credentials;
try {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
} catch (error) {
    console.error('❌ Error: credentials.json not found');
    console.log('Please ensure credentials.json exists in the server directory');
    process.exit(1);
}

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive'
    ],
    // Add clock skew tolerance
    clientOptions: {
        clockSkew: 300 // 5 minutes tolerance
    }
});

const drive = google.drive({ version: 'v3', auth });

// Get or create backup folder in Google Drive
async function getOrCreateBackupFolder() {
    try {
        // Use the shared folder ID directly
        const SHARED_FOLDER_ID = '1l8X3mb5ZGTY0ELIFgMblB0tg5TdPpG5A';

        console.log('✅ Using shared "MongoDB Backups" folder');
        return SHARED_FOLDER_ID;
    } catch (error) {
        console.error('❌ Error accessing folder:', error.message);
        throw error;
    }
}

// Get or create month folder (e.g., "2025-11")
async function getOrCreateMonthFolder(parentFolderId) {
    try {
        const now = new Date();
        const monthName = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Search for existing month folder
        const response = await drive.files.list({
            q: `name='${monthName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (response.data.files.length > 0) {
            return response.data.files[0].id;
        }

        // Create new month folder
        console.log(`📁 Creating folder: ${monthName}`);
        const folderMetadata = {
            name: monthName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId],
        };

        const folder = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id',
        });

        return folder.data.id;
    } catch (error) {
        console.error('❌ Error creating month folder:', error.message);
        throw error;
    }
}

// Upload file to Google Drive
async function uploadFile(filePath, folderId) {
    try {
        const fileName = path.basename(filePath);
        const fileSize = fs.statSync(filePath).size;
        const fileSizeKB = (fileSize / 1024).toFixed(2);

        console.log(`\n📤 Uploading: ${fileName} (${fileSizeKB} KB)`);

        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };

        const media = {
            mimeType: 'application/zip',
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink',
            supportsAllDrives: true,
        });

        console.log(`✅ Uploaded successfully!`);
        console.log(`   File ID: ${response.data.id}`);
        console.log(`   View: ${response.data.webViewLink}`);

        return response.data;
    } catch (error) {
        console.error(`❌ Error uploading ${path.basename(filePath)}:`, error.message);
        throw error;
    }
}

// Get latest backup ZIP file
function getLatestBackupZip() {
    if (!fs.existsSync(BACKUP_DIR)) {
        console.error('❌ Error: No backups directory found');
        console.log('Run "npm run backup" first to create a backup');
        process.exit(1);
    }

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.zip'))
        .map(f => ({
            name: f,
            path: path.join(BACKUP_DIR, f),
            time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
        console.error('❌ Error: No backup ZIP files found');
        console.log('Run "npm run backup" first to create a backup');
        process.exit(1);
    }

    return files[0];
}

// Main function
async function uploadToGoogleDrive() {
    try {
        console.log('🚀 Starting Google Drive upload...\n');

        // Get latest backup
        const latestBackup = getLatestBackupZip();
        console.log(`📦 Latest backup: ${latestBackup.name}`);

        // Get shared folder
        const backupFolderId = await getOrCreateBackupFolder();

        // Upload file directly to shared folder (no month subfolder to avoid quota issues)
        const uploadedFile = await uploadFile(latestBackup.path, backupFolderId);

        console.log('\n✅ Upload completed successfully!');
        console.log('\n📁 Google Drive Location:');
        console.log('   MongoDB Backups/');
        console.log(`   └── ${uploadedFile.name}`);
        console.log('\n🔗 Access your backups at: https://drive.google.com/drive/folders/1l8X3mb5ZGTY0ELIFgMblB0tg5TdPpG5A\n');

    } catch (error) {
        console.error('\n❌ Upload failed:', error.message);

        if (error.message.includes('insufficient authentication scopes')) {
            console.log('\n⚠️  Google Drive API may not be enabled.');
            console.log('Enable it at: https://console.cloud.google.com/apis/library/drive.googleapis.com');
        }

        if (error.message.includes('storage quota')) {
            console.log('\n⚠️  Service account storage quota issue.');
            console.log('Make sure you shared the folder with the service account:');
            console.log('   expenses-tracker-service@expenses-tracker-478817.iam.gserviceaccount.com');
        }

        process.exit(1);
    }
}

// Run upload
uploadToGoogleDrive();
