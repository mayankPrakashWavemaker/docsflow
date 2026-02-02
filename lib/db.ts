import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose_cache: { [key: string]: MongooseCache } | undefined;
}

if (!global.mongoose_cache) {
  global.mongoose_cache = {};
}

const cached = global.mongoose_cache;

async function connectDB(dbName: string) {
  if (!dbName) {
    throw new Error('connectDB requires an explicit database name');
  }

  if (!cached[dbName]) {
    cached[dbName] = { conn: null, promise: null };
  }

  if (cached[dbName].conn) {
    return cached[dbName].conn;
  }

  if (!cached[dbName].promise) {
    const opts = {
      bufferCommands: false,
      dbName: dbName,
    };

    // Use createConnection for database-specific instances
    const conn = mongoose.createConnection(MONGODB_URI!, opts);
    cached[dbName].promise = conn.asPromise();
  }

  try {
    cached[dbName].conn = await cached[dbName].promise;
  } catch (e) {
    cached[dbName].promise = null;
    throw e;
  }

  return cached[dbName].conn;
}

export default connectDB;
