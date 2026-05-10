import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 50000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
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

export default connectDB;