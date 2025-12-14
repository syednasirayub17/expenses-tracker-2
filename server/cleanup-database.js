require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expenses-tracker';

async function cleanupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // List all collections to clean
    const collections = [
      'transactions',
      'bankaccounts',
      'creditcards',
      'loans',
      'budgets',
      'savings',
      'reconciliations',
      'categories'
    ];

    console.log('\n⚠️  WARNING: This will delete ALL data from the following collections:');
    collections.forEach(col => console.log(`   - ${col}`));
    console.log('\n📝 User accounts will NOT be deleted (you can still login)');
    
    // Wait 3 seconds before proceeding
    console.log('\n⏳ Starting cleanup in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete all documents from each collection
    for (const collectionName of collections) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✅ Cleaned ${collectionName}: ${result.deletedCount} documents deleted`);
      } catch (err) {
        if (err.message.includes('ns not found')) {
          console.log(`ℹ️  Collection ${collectionName} does not exist, skipping...`);
        } else {
          console.error(`❌ Error cleaning ${collectionName}:`, err.message);
        }
      }
    }

    console.log('\n✨ Database cleanup completed!');
    console.log('📊 Summary:');
    console.log('   - All transactions deleted');
    console.log('   - All accounts deleted (bank, credit card, loan)');
    console.log('   - All budgets and savings deleted');
    console.log('   - User login credentials preserved');
    console.log('\n🎯 You can now start fresh with new accounts and transactions!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
console.log('═══════════════════════════════════════════════════════');
console.log('     MongoDB Database Cleanup Script');
console.log('═══════════════════════════════════════════════════════\n');

cleanupDatabase();
