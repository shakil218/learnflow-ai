import { MongoClient, Db } from "mongodb";
import { config } from "../config/env";

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && dbInstance) {
    return { client, db: dbInstance };
  }

  try {
    client = new MongoClient(config.mongodbUri);
    await client.connect();
    dbInstance = client.db(config.dbName);
    console.log(`[Database] Successfully connected to MongoDB database: ${config.dbName}`);
    return { client, db: dbInstance };
  } catch (error) {
    console.error("[Database] Error connecting to MongoDB:", error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!dbInstance) {
    throw new Error("[Database] Database not initialized. Call connectToDatabase first.");
  }
  return dbInstance;
}

export function getMongoClient(): MongoClient {
  if (!client) {
    throw new Error("[Database] MongoClient not initialized. Call connectToDatabase first.");
  }
  return client;
}
