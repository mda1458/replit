import { Pool as NeonPool, Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from "@shared/schema";
import * as dotenv from "dotenv";
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import ws from "ws";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log(`🔍 Raw DATABASE_URL: ${process.env.DATABASE_URL}`);

// Check if we're using Neon (serverless) or regular PostgreSQL
// For localhost, always use regular PostgreSQL
const isNeonDb = !process.env.DATABASE_URL.includes('localhost') && (
  process.env.DATABASE_URL.includes('neon.tech') ||
  process.env.DATABASE_URL.includes('neondb.net') ||
  process.env.DATABASE_URL.includes('@ep-')
);

let db: any;
let pool: any;

if (isNeonDb) {
  // Use Neon serverless for production
  console.log('🔗 Connecting to Neon serverless database...');
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Use regular PostgreSQL for development
  console.log('🔗 Connecting to PostgreSQL database...');
  console.log(`📍 Database URL: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);
  db = drizzleNode({ client: new Pool({ connectionString: process.env.DATABASE_URL }) });
}

export { db, pool };
