import { usersCollection } from "../client.ts";
import { USE_DB } from "../../config/config.ts";

const inMemoryStorage = new Map<number, any>();

export const UserRepository = {
  async findOrCreate(userId: number): Promise<any> {
    if (USE_DB && usersCollection) {
      let user = await usersCollection.findOne({ user_id: userId });
      if (!user) {
        await usersCollection.insertOne({
          user_id: userId,
          email: "",
          email_token: "",
          idnum: ""
        });
        user = await usersCollection.findOne({ user_id: userId });
      }
      return user;
    }
    return inMemoryStorage.get(userId) || { user_id: userId, email: "", email_token: "", idnum: "" };
  },

  async updateUser(userId: number, data: object): Promise<void> {
    if (USE_DB && usersCollection) {
      await usersCollection.updateOne(
        { user_id: userId },
        { $set: data }
      );
    } else {
      const current = inMemoryStorage.get(userId) || { user_id: userId };
      inMemoryStorage.set(userId, { ...current, ...data });
    }
  },

  async countUsers(): Promise<number> {
    if (USE_DB && usersCollection) return await usersCollection.countDocuments();
    return inMemoryStorage.size;
  }
};