import { hashSync } from "bcrypt";
import { randomBytes } from "crypto";
import { Collection, Db, ObjectId } from "mongodb";
import requireEnv from "./requireEnv";
import Users from "./Users";

const MONGO_AUTHTOKENS_COLLECTION = requireEnv("MONGO_AUTHTOKENS_COLLECTION");

export type TokenData = {
    token: string,
    userName: string;
};

type TokenDataMongo = TokenData & {
    _id: ObjectId;
};

export default class AuthTokens {
    private authTokensCollection: Collection<TokenDataMongo>;

    public constructor(private mongoDb: Db) {
        this.authTokensCollection = this.mongoDb.collection(MONGO_AUTHTOKENS_COLLECTION);
    }

    public generateAuthToken(): string {
        return randomBytes(30).toString('hex');
    }

    public getNewToken(userName: string): Promise<string> {
        const token = this.generateAuthToken();
        return this.authTokensCollection.insertOne({
            token: token,
            userName: userName
        }).then(result => {
            //console.log(result);
            return token;
        });
    }

    public getAllTokens() {
        return this.authTokensCollection.find();
    }

    public deleteToken(token: string) {
        return this.authTokensCollection.deleteOne({ token: token });
    }

    public getUserName(token: string) {
        return this.authTokensCollection.findOne({ token: token });
    }
}