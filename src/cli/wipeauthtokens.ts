#!/usr/bin/node

import AuthTokens from "../AuthTokens";
import { connectToDatabase } from "../connectToDatabase";

async function main() {
    const db = await connectToDatabase();
    const authDb = new AuthTokens(db);

    await authDb.wipe();
    process.exit(0);
}

main();