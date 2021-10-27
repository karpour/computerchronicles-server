import AuthTokens from "../AuthTokens";
import { connectToDatabase } from "../connectToDatabase";
import Users from "../Users";

async function main() {
    const db = await connectToDatabase();
    const authDb = new AuthTokens(db);

    let tokens = await authDb.getAllTokens().toArray();
    tokens.forEach(
        token => console.log(`${token.userName} ${token.token.substr(0,5)}...`)
    );
    process.exit(0);
}

main();