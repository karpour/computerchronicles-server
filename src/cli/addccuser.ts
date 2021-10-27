import { connectToDatabase } from "../connectToDatabase";
import Users, { UserRole } from "../Users";

async function main() {
    const db = await connectToDatabase();
    const usersDb = new Users(db);
    if (process.argv.length == 5 || process.argv.length == 6) {
        try {
            await usersDb.createUser(process.argv[2], process.argv[3], process.argv[4], process.argv[5] as UserRole ?? "user");
        } catch (err) {
            console.log((err as any).message);
        }
        console.log(await usersDb.getUser(process.argv[2]));
    } else {
        console.error(`Usage: addccuser <name> <password> <email> <role>`);
    }
    process.exit(0);
}

main();