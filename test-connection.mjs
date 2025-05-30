// Test MongoDB connection
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("🔍 Testing MongoDB Atlas connection...");
    console.log(
      "📡 Connection URL:",
      process.env.DATABASE_URL?.replace(/:[^:]*@/, ":****@")
    );

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`👥 Found ${userCount} users in database`);

    console.log("🎉 Database connection is working perfectly!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);

    if (error.message.includes("Server selection timeout")) {
      console.log("\n🔧 Troubleshooting steps:");
      console.log("1. Check if your IP is whitelisted in MongoDB Atlas");
      console.log("2. Verify your cluster is running (not paused)");
      console.log("3. Check your network connection");
      console.log("4. Verify username/password in connection string");
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
