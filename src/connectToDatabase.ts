import * as mongoDB from "mongodb";
import requireEnv from "./requireEnv";

export const MONGO_DB_CONN_STRING = requireEnv("MONGO_DB_CONN_STRING");
export const MONGO_DB_NAME = requireEnv("MONGO_DB_NAME");

export async function connectToDatabase(): Promise<mongoDB.Db> {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(MONGO_DB_CONN_STRING);
    await client.connect();

    return client.db(MONGO_DB_NAME);
}
