import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

let client: MongoClient;
let db: Db;

const connect = async (): Promise<Db> => {
  if (db) return db;

  client = new MongoClient(uri);

  await client.connect();

  db = client.db("deschamps-news");

  return db;
};

export default { connect };
