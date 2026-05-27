// import mongoose from 'mongoose';

// const connectDB = async (): Promise<void> => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
//       serverSelectionTimeoutMS: 50000, // 5 seconds timeout
//       socketTimeoutMS: 45000, // 45 seconds socket timeout
//       family: 4, // Use IPv4, skip trying IPv6
//       retryWrites: true,
//       retryReads: true,
//     });
//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//     console.log(`✅ Database: ${conn.connection.name}`);
//   } catch (error: any) {
//     console.error(`Error: ${error}`); 
//     console.error(`Error: ${error.message}`);
//     console.log('Please check:');
//     console.log('1. Is your IP whitelisted in MongoDB Atlas?');
//     console.log('2. Is your connection string correct?');
//     console.log('3. Is your username/password correct?');
//     process.exit(1);
//   }
// };

// export default connectDB;

import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 50000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    
    // Clean up problematic indexes after connection
    await cleanupIndexes();
    await cleanupFlashcardIndexes(); // Add this line
    
  } catch (error: any) {
    console.error(`Error: ${error}`); 
    console.error(`Error: ${error.message}`);
    console.log('Please check:');
    console.log('1. Is your IP whitelisted in MongoDB Atlas?');
    console.log('2. Is your connection string correct?');
    console.log('3. Is your username/password correct?');
    process.exit(1);
  }
};

const cleanupIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('documents');
    
    // Get all indexes
    const indexes = await collection.indexes();
    
    // Check for problematic index
    const problematicIndex = indexes.find(idx => idx.name === 'userId_1_uploadDate_-1');
    
    if (problematicIndex) {
      console.log('⚠️ Found problematic index on documents, dropping...');
      await collection.dropIndex('userId_1_uploadDate_-1');
      console.log('✅ Dropped problematic index on documents');
    }
    
    // Create correct indexes if they don't exist
    const indexNames = indexes.map(idx => idx.name);
    
    if (!indexNames.includes('userId_1_createdAt_-1')) {
      await collection.createIndex({ userId: 1, createdAt: -1 });
      console.log('✅ Created index on documents: userId_1_createdAt_-1');
    }
    
    if (!indexNames.includes('userId_1_status_1')) {
      await collection.createIndex({ userId: 1, status: 1 });
      console.log('✅ Created index on documents: userId_1_status_1');
    }
    
  } catch (error) {
    console.error('Error cleaning up documents indexes:', error);
  }
};

// New function to clean up flashcards collection indexes
const cleanupFlashcardIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('flashcards');
    
    // Check if collection exists
    const collections = await db.listCollections({ name: 'flashcards' }).toArray();
    if (collections.length === 0) {
      console.log('⚠️ Flashcards collection does not exist yet, skipping index cleanup');
      return;
    }
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('📋 Current flashcards indexes:', indexes.map(idx => ({ name: idx.name, unique: idx.unique || false })));
    
    // Find and drop the unique index if it exists
    const uniqueIndex = indexes.find(idx => idx.name === 'userId_1_documentId_1' && idx.unique === true);
    
    if (uniqueIndex) {
      console.log('⚠️ Found UNIQUE index on flashcards: userId_1_documentId_1, dropping...');
      await collection.dropIndex('userId_1_documentId_1');
      console.log('✅ Dropped unique index on flashcards');
    } else {
      console.log('✅ No unique index found on flashcards');
    }
    
    // Create regular (non-unique) indexes if they don't exist
    const indexNames = indexes.map(idx => idx.name);
    
    if (!indexNames.includes('userId_1_documentId_1')) {
      await collection.createIndex({ userId: 1, documentId: 1 });
      console.log('✅ Created regular index on flashcards: userId_1_documentId_1');
    }
    
    if (!indexNames.includes('userId_1_createdAt_-1')) {
      await collection.createIndex({ userId: 1, createdAt: -1 });
      console.log('✅ Created index on flashcards: userId_1_createdAt_-1');
    }
    
    // Verify the index is not unique
    const finalIndexes = await collection.indexes();
    const finalUniqueIndex = finalIndexes.find(idx => idx.name === 'userId_1_documentId_1');
    if (finalUniqueIndex) {
      console.log(`✅ Final index on flashcards: ${finalUniqueIndex.name} - Unique: ${finalUniqueIndex.unique || false}`);
    }
    
  } catch (error) {
    console.error('Error cleaning up flashcards indexes:', error);
  }
};

export default connectDB;