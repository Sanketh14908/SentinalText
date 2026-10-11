const mongoose = require('mongoose');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) return;

  const atlasUri = process.env.MONGODB_URI;

  if (atlasUri) {
    try {
      console.log('[DATABASE] Attempting connection to MongoDB Atlas...');
      const conn = await mongoose.connect(atlasUri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      console.log(`[DATABASE] ✅ MongoDB Atlas Connected: ${conn.connection.host} / ${conn.connection.name}`);
      return;
    } catch (atlasError) {
      console.warn(`[DATABASE WARNING] Atlas connection failed (${atlasError.message}).`);
      console.log('[DATABASE] 🔄 Automatically starting Local In-Memory MongoDB fallback so all features work seamlessly...');
    }
  }

  // Fallback: Start local in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!mongoMemoryServerInstance) {
      mongoMemoryServerInstance = await MongoMemoryServer.create();
    }
    const localUri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(localUri);
    console.log(`[DATABASE] ✅ Connected to Local In-Memory MongoDB: ${localUri}`);
  } catch (memError) {
    console.error(`[DATABASE ERROR] Failed to initialize local MongoDB: ${memError.message}`);
  }
};

module.exports = connectDB;
