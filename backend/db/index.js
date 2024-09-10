import mongoose from 'mongoose';

const connectdb = async () => {
  try {
    const dbName = process.env.DATABASE; // Ensure DATABASE is defined
    const mongoUrl = `${process.env.MONGODB_URL}/${dbName}`;

    if (!process.env.MONGODB_URL || !dbName) {
      throw new Error("MONGODB_URL or DATABASE environment variable is not defined");
    }

    let connection = await mongoose.connect(mongoUrl, {
    
    });
    console.log('MongoDB connected');
    return connection; // Return the connection if needed elsewhere
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit the process if the DB connection fails
  }
};

export { connectdb };
