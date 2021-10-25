import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import requireEnv from "./requireEnv";

const MONGO_DB_CONN_STRING = requireEnv("MONGO_DB_CONN_STRING");
const MONGO_COLLECTION_NAME = requireEnv("MONGO_COLLECTION_NAME");
const MONGO_DB_NAME = requireEnv("MONGO_DB_NAME");

export async function connectToDatabase() {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(MONGO_DB_CONN_STRING);
    await client.connect();

    const db: mongoDB.Db = client.db(MONGO_DB_NAME);

    const collection: mongoDB.Collection = db.collection(MONGO_COLLECTION_NAME);

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${collection.collectionName}`);
}