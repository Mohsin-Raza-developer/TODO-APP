/**
 * Initialize Better Auth Database Tables
 *
 * This script creates the required tables for Better Auth
 * Run with: npx tsx scripts/init-db.ts
 */

import { auth } from "../lib/auth";

async function initDatabase() {
  try {
    console.log("Initializing Better Auth database tables...");

    // Better Auth will create tables automatically on first API call
    // But we can trigger it manually by calling the internal init
    const adapter = (auth as any).options.database.adapter;

    if (adapter && adapter.init) {
      await adapter.init();
      console.log("✓ Database tables created successfully");
    } else {
      console.log("⚠ No adapter init method found - tables will be created on first auth request");
    }

    process.exit(0);
  } catch (error) {
    console.error("✗ Failed to initialize database:", error);
    process.exit(1);
  }
}

initDatabase();
