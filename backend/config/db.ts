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
      console.log('⚠️ Found problematic index, dropping...');
      await collection.dropIndex('userId_1_uploadDate_-1');
      console.log('✅ Dropped problematic index');
    }
    
    // Create correct indexes if they don't exist
    const indexNames = indexes.map(idx => idx.name);
    
    if (!indexNames.includes('userId_1_createdAt_-1')) {
      await collection.createIndex({ userId: 1, createdAt: -1 });
      console.log('✅ Created index: userId_1_createdAt_-1');
    }
    
    if (!indexNames.includes('userId_1_status_1')) {
      await collection.createIndex({ userId: 1, status: 1 });
      console.log('✅ Created index: userId_1_status_1');
    }
    
  } catch (error) {
    console.error('Error cleaning up indexes:', error);
  }
};

export default connectDB;