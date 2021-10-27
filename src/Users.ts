import { hashSync } from "bcrypt";
import { Collection, Db, ObjectId } from "mongodb";
import requireEnv from "./requireEnv";

const MONGO_USERS_COLLECTION = requireEnv("MONGO_USERS_COLLECTION");

const SALT = requireEnv("SALT");


export type UserRole = "admin" | "user";

export type UserData = {
    name: string,
    email: string,
    password: string;
    role: UserRole;
};

type UserDataMongo = UserData & {
    _id: ObjectId;
};

export default class Users {
    private usersCollection: Collection<UserDataMongo>;

    public constructor(private mongoDb: Db) {
        this.usersCollection = this.mongoDb.collection(MONGO_USERS_COLLECTION);
    }

    private getHashedPassword(password: string) {
        return hashSync(password, SALT);
    };

    public createUserObjectId(name: string): ObjectId {
        if (name.length > 12) throw new Error("Username can't be longer than 12 characters");
        return new ObjectId(name.padStart(12, '0'));
    }

    public createUser(name: string, email: string, password: string, role: UserRole = "user") {
        let userDataMongo: UserDataMongo = {
            _id: this.createUserObjectId(name),
            name: name,
            email: email,
            password: this.getHashedPassword(password),
            role: role
        };

        return this.usersCollection.insertOne(userDataMongo);
    }

    public getUser(userName: string): Promise<UserData | null> {
        return this.usersCollection.findOne({ name: userName });
    }

    public getAllUsers() {
        return this.usersCollection.find();
    }

    public getUserAuth(userName: string, password: string) {
        console.log(`User auth: ${userName}:${this.getHashedPassword(password)}`);
        return this.usersCollection.findOne({
            name: userName,
            password: this.getHashedPassword(password)
        });
    }

    public deleteUser(userName: string) {
        return this.usersCollection.deleteOne({ name: userName });
    }

    public changeUserRole(userName: string, role: UserRole) {
        return this.usersCollection.updateOne({ name: userName }, { $set: { role: role } });
    }
}