import { Collection, Db, InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { ComputerChroniclesEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";
import getEpisodeDiffs from "./getEpisodeDiffs";
import requireEnv from "./requireEnv";

type ComputerChroniclesEpisodeMetadataMongo = ComputerChroniclesEpisodeMetadata & { _id: ObjectId; version: number; };

const MONGO_EPISODES_COLLECTION = requireEnv("MONGO_EPISODES_COLLECTION");
const MONGO_ARCHIVE_COLLECTION = requireEnv("MONGO_ARCHIVE_COLLECTION");

export default class ComputerChroniclesEpisodeDb {
    protected episodeCollection: Collection<ComputerChroniclesEpisodeMetadataMongo>;
    protected episodeArchive: Collection<ComputerChroniclesEpisodeMetadataMongo>;

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
        return this.episodeCollection.find().toArray();
    }

    public async getAllArchivedEpisodes(): Promise<ComputerChroniclesEpisodeMetadata[]> {
        return this.episodeArchive.find().toArray();
    }

    public async getEpisode(episodeNumber: number, version?: number): Promise<ComputerChroniclesEpisodeMetadata | null> {
        let ep: ComputerChroniclesEpisodeMetadata | null = null;
        if (version === undefined) {
            ep = await this.episodeCollection.findOne({ _id: this.getEpisodeObjectId(episodeNumber) });
        } else {
            ep = await this.episodeCollection.findOne({ _id: this.getEpisodeObjectId(episodeNumber), version: version });
            if (!ep) ep = await this.episodeArchive.findOne({ _id: this.getEpisodeObjectArchiveId(episodeNumber, version), version: version });
        }
        if(ep) delete (ep as any)._id;
        return ep;
    }

    public async updateEpisode(newEpisode: ComputerChroniclesEpisodeMetadata): Promise<UpdateResult | null> {
        let oldEpisode = await this.episodeCollection.findOne({ _id: this.getEpisodeObjectId(newEpisode.episodeNumber) });
        if (!oldEpisode) throw new Error(`No episode with episode number ${newEpisode.episodeNumber} exists`);

        // Insert old version into version db  
        let diffs = getEpisodeDiffs(oldEpisode, newEpisode);
        if (diffs?.length) {
            console.log(`Diffs found, updating episode from version ${oldEpisode.version} -> ${oldEpisode.version + 1}`);
            console.log(diffs);
            // Create new episode object
            let newEpisodeDataMongo = { ...newEpisode, version: oldEpisode.version + 1 };
            this.episodeArchive.insertOne({ ...oldEpisode, _id: this.getEpisodeObjectArchiveId(oldEpisode.episodeNumber, oldEpisode.version) });

            return this.episodeCollection.updateOne({ _id: this.getEpisodeObjectId(oldEpisode.episodeNumber) }, { $set: newEpisodeDataMongo });
        }
        console.log("No changes, skipping");
        return null;
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
        this.episodeCollection.drop();
        this.episodeArchive.drop();
    }
}
