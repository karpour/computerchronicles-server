import { connectToDatabase } from "../connectToDatabase";
import Users from "../Users";

async function main() {
    const db = await connectToDatabase();
    const usersDb = new Users(db);
    if (process.argv.length == 3) {
        try {
            await usersDb.deleteUser(process.argv[2])
        } catch (err) {
            console.log((err as any).message);
        }
    } else {
        console.error(`Usage: delccuser <name>`);
    }
    process.exit(0);
}

main();