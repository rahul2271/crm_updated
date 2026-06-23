import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) throw new Error('MONGODB_URI not defined in .env.local')

interface Cache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
declare global { var mongoose: Cache | undefined }

const cached: Cache = global.mongoose ?? { conn: null, promise: null }
if (!global.mongoose) global.mongoose = cached

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  cached.conn = await cached.promise
  return cached.conn
}
