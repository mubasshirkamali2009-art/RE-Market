import dns from 'node:dns'
dns.setDefaultResultOrder('ipv4first')

import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGO_DB_URI);
await client.connect();
const db = client.db(process.env.AUTH_DB_NAME);

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: mongodbAdapter(db),
  accountLinking: {
    enabled: true,
    trustedProviders: ["google"],
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "buyer",
        input: true,
      },
    },
  },
});