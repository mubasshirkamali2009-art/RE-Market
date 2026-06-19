import dns from 'node:dns'
dns.setServers(['8.8.8.8','8.8.4.4'])
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGO_DB_URI);
const db = client.db(process.env.AUTH_DB_NAME);




export const auth = betterAuth({
    emailAndPassword: { 
    enabled: true, 
  }, 
//    socialProviders: {
//         google: { 
//             clientId: process.env.GOOGLE_CLIENT_ID as string, 
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
//         }, 
//     },
  database: mongodbAdapter(db, {
   
    client
  }),
});