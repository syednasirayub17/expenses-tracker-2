const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

console.log('🔍 Diagnosing Google Drive API Connection...\n');

// Load credentials
let credentials;
try {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    console.log('✅ Credentials file loaded');
    console.log(`   Service Account: ${credentials.client_email}`);
    console.log(`   Project ID: ${credentials.project_id}\n`);
} catch (error) {
    console.error('❌ Error loading credentials:', error.message);
    process.exit(1);
}

// Check system time
console.log('🕐 System Time Check:');
const now = new Date();
console.log(`   Local Time: ${now.toISOString()}`);
console.log(`   Timestamp: ${Math.floor(now.getTime() / 1000)}\n`);

// Test authentication
async function testAuth() {
    try {
        console.log('🔐 Testing Authentication...\n');

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive'
            ],
        });

        // Get access token
        console.log('   Requesting access token...');
        const client = await auth.getClient();
        const token = await client.getAccessToken();

        if (token.token) {
            console.log('   ✅ Access token obtained successfully!\n');

            // Test Drive API
            console.log('📁 Testing Google Drive API...\n');
            const drive = google.drive({ version: 'v3', auth });

            const response = await drive.files.list({
                pageSize: 1,
                fields: 'files(id, name)',
            });

            console.log('   ✅ Google Drive API is working!\n');
            console.log('✅ All checks passed! Your Google Drive integration is ready.\n');

        } else {
            console.log('   ❌ Failed to obtain access token\n');
        }

    } catch (error) {
        console.error('❌ Authentication failed:\n');
        console.error(`   Error: ${error.message}\n`);

        if (error.message.includes('invalid_grant')) {
            console.log('💡 Possible Solutions:\n');
            console.log('   1. Enable Google Drive API:');
            console.log('      https://console.cloud.google.com/apis/library/drive.googleapis.com?project=' + credentials.project_id);
            console.log('');
            console.log('   2. Check system time synchronization:');
            console.log('      macOS: System Preferences > Date & Time > Set automatically');
            console.log('');
            console.log('   3. Generate new service account key:');
            console.log('      https://console.cloud.google.com/iam-admin/serviceaccounts?project=' + credentials.project_id);
            console.log('      - Click on service account');
            console.log('      - Go to "Keys" tab');
            console.log('      - Add new key (JSON)');
            console.log('      - Replace credentials.json with new file\n');
        }

        if (error.message.includes('API has not been used')) {
            console.log('⚠️  Google Drive API is NOT enabled!\n');
            console.log('   Enable it here:');
            console.log('   https://console.cloud.google.com/apis/library/drive.googleapis.com?project=' + credentials.project_id);
            console.log('');
            console.log('   After enabling, wait 1-2 minutes and try again.\n');
        }

        process.exit(1);
    }
}

testAuth();
