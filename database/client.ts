import { MongoClient, Collection } from "npm:mongodb";
import { MONGO_URI, USE_DB } from "../config/config.ts";

let client: MongoClient | null = null;
let db: any = null;
let usersCollection: Collection | undefined = undefined;

if (USE_DB) {
  try {
    client = new MongoClient(MONGO_URI!);
    await client.connect();
    console.log("✅ MongoDB connected (using npm:mongodb)");
    db = client.db("temp_mail_bot");
    usersCollection = db.collection("users");
  } catch (error: any) {
    console.error("⚠️ MongoDB connection failed:", error.message);
  }
}

export { usersCollection };