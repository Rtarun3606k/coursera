const { MongoClient } = require("mongodb");

const uri =
  "mongodb://coursera:eFR8zbq1EsgH7VV1ZzWEWsEG2CJyrl01VPEtcJnuKZKcKMCucPfP2hVxv9PxkUjhpdHINVfZHSdfACDbFRhKRA==@coursera.mongo.cosmos.azure.com:10255/courseradb?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@coursera@";

async function createCollections() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to Azure Cosmos DB");

    const db = client.db("courseradb");

    // Create collections for NextAuth.js
    const collections = ["User", "Account", "Session", "VerificationToken"];

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`Collection ${collectionName} already exists`);
        } else {
          console.error(`Error creating collection ${collectionName}:`, error);
        }
      }
    }

    // Create indexes for better performance
    await db.collection("User").createIndex({ email: 1 }, { unique: true });
    await db
      .collection("Account")
      .createIndex({ provider: 1, providerAccountId: 1 }, { unique: true });
    await db
      .collection("Session")
      .createIndex({ sessionToken: 1 }, { unique: true });
    await db.collection("Session").createIndex({ expires: 1 });
    await db
      .collection("VerificationToken")
      .createIndex({ identifier: 1, token: 1 }, { unique: true });

    console.log("All collections and indexes created successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

createCollections();
