import { connectToDatabase } from "../connectToDatabase";
import Users from "../Users";

async function main() {
    const db = await connectToDatabase();
    const usersDb = new Users(db);
    let users = await usersDb.getAllUsers().toArray();
    users.forEach(
        user => console.log(`${user.name}${user.role == "admin" ? " *" : ""}`)
    );
    process.exit(0);
}

main();