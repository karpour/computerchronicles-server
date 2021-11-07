import { Collection, Db, InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { ComputerChroniclesEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";
import getEpisodeDiffs from "./getEpisodeDiffs";
import requireEnv from "./requireEnv";

type MongoData = { _id: ObjectId; version: number; };

type ComputerChroniclesEpisodeMetadataMongo = ComputerChroniclesEpisodeMetadata & MongoData;

const MONGO_EPISODES_COLLECTION = requireEnv("MONGO_EPISODES_COLLECTION");
const MONGO_ARCHIVE_COLLECTION = requireEnv("MONGO_ARCHIVE_COLLECTION");

type ComputerChroniclesEpisodeUpdateResult = {
    episodeWasUpdated: true,
    changes: string[];
    episodeNumber: number;
} | {
    episodeWasUpdated: false,
};

export default class ComputerChroniclesEpisodeDb {
    protected episodeCollection: Collection<ComputerChroniclesEpisodeMetadataMongo>;
    protected episodeArchive: Collection<ComputerChroniclesEpisodeMetadataMongo>;

    public stripMongoData(episode: ComputerChroniclesEpisodeMetadataMongo): ComputerChroniclesEpisodeMetadata {
        let ep: ComputerChroniclesEpisodeMetadata & Partial<MongoData> = episode;
        delete ep._id;
        delete ep.version;
        return ep;
    }

    private getEpisodeObjectId(episodeNumber: number): ObjectId {
        return new ObjectId(`${episodeNumber}`.padStart(12, '0'));
    }

    private getEpisodeObjectArchiveId(episodeNumber: number, version: number): ObjectId {
        return new ObjectId(`${episodeNumber}v${version}`.padStart(12, '0'));
    }

    public constructor(private mongoDb: Db) {
        this.episodeCollection = this.mongoDb.collection(MONGO_EPISODES_COLLECTION);
        this.episodeArchive = this.mongoDb.collection(MONGO_ARCHIVE_COLLECTION);
    }

    public async getAllEpisodes(): Promise<ComputerChroniclesEpisodeMetadata[]> {
        return this.episodeCollection.find().toArray().then(array => array.map(this.stripMongoData));
    }

    public async getAllArchivedEpisodes(): Promise<ComputerChroniclesEpisodeMetadata[]> {
        return this.episodeArchive.find().toArray().then(array => array.map(this.stripMongoData));
    }

    public async getEpisode(episodeNumber: number, version?: number): Promise<ComputerChroniclesEpisodeMetadata | null> {
        let ep: ComputerChroniclesEpisodeMetadataMongo | null = null;
        if (version === undefined) {
            ep = await this.episodeCollection.findOne({ _id: this.getEpisodeObjectId(episodeNumber) });
        } else {
            ep = await this.episodeCollection.findOne({ _id: this.getEpisodeObjectId(episodeNumber), version: version });
            if (!ep) ep = await this.episodeArchive.findOne({ _id: this.getEpisodeObjectArchiveId(episodeNumber, version), version: version });
        }
        if (ep) return this.stripMongoData(ep);
        return null;
    }

    public async updateEpisode(newEpisode: ComputerChroniclesEpisodeMetadata): Promise<ComputerChroniclesEpisodeUpdateResult> {
        let oldEpisode = await this.episodeCollection.findOne({ _id: this.getEpisodeObjectId(newEpisode.episodeNumber) });
        if (!oldEpisode) throw new Error(`No episode with episode number ${newEpisode.episodeNumber} exists`);

        // Insert old version into version db  
        let diffs = getEpisodeDiffs(oldEpisode, newEpisode);
        if (diffs?.length) {
            // Create new episode object
            let newEpisodeDataMongo = { ...newEpisode, version: oldEpisode.version + 1 };
            this.episodeArchive.insertOne({ ...oldEpisode, _id: this.getEpisodeObjectArchiveId(oldEpisode.episodeNumber, oldEpisode.version) });
            let result = await this.episodeCollection.updateOne({ _id: this.getEpisodeObjectId(oldEpisode.episodeNumber) }, { $set: newEpisodeDataMongo });
            if (!result.modifiedCount) {
                throw new Error("No episode was updated");
            }
            return {
                episodeWasUpdated: true,
                episodeNumber: newEpisode.episodeNumber,
                changes: diffs
            };
        }
        return {
            episodeWasUpdated: false
        };
    }

    public async insertEpisode(episode: ComputerChroniclesEpisodeMetadata): Promise<InsertOneResult<ComputerChroniclesEpisodeMetadata>> {
        const episodeWithId: ComputerChroniclesEpisodeMetadataMongo = {
            ...episode,
            _id: this.getEpisodeObjectId(episode.episodeNumber),
            version: 1
        };
        return this.episodeCollection.insertOne(episodeWithId);
    }

    public async wipe() {
        await this.episodeCollection.drop();
        await this.episodeArchive.drop();
    }
}
