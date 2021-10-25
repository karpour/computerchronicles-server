import { Collection, Db, InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { ComputerChroniclesEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";
import getEpisodeDiffs from "./getEpisodeDiffs";

type ComputerChroniclesEpisodeMetadataMongo = ComputerChroniclesEpisodeMetadata & { _id: ObjectId; version: number; };

export default class ComputerChroniclesEpisodeDb {
    public static readonly EPISODES_COLLECTION_NAME: string = "episodes";
    public static readonly EPISODES_ARCHIVE_COLLECTION_NAME: string = "episodesarchive";
    protected episodeCollection: Collection<ComputerChroniclesEpisodeMetadataMongo>;
    protected episodeArchive: Collection<ComputerChroniclesEpisodeMetadataMongo>;

    private getEpisodeObjectId(episodeNumber: number): ObjectId {
        return new ObjectId(`${episodeNumber}`.padStart(12, '0'));
    }

    private getEpisodeObjectArchiveId(episodeNumber: number, version: number): ObjectId {
        return new ObjectId(`${episodeNumber}v${version}`.padStart(12, '0'));
    }

    public constructor(private mongoDb: Db) {
        this.episodeCollection = this.mongoDb.collection(ComputerChroniclesEpisodeDb.EPISODES_COLLECTION_NAME);
        this.episodeArchive = this.mongoDb.collection(ComputerChroniclesEpisodeDb.EPISODES_ARCHIVE_COLLECTION_NAME);
    }

    public async getAllEpisodes(): Promise<ComputerChroniclesEpisodeMetadata[]> {
        return this.episodeCollection.find().toArray();
    }

    public async getAllArchivedEpisodes(): Promise<ComputerChroniclesEpisodeMetadata[]> {
        return this.episodeArchive.find().toArray();
    }

    public getEpisode(episodeNumber: number): Promise<ComputerChroniclesEpisodeMetadata | null> {
        return this.episodeCollection.findOne({ _id: this.getEpisodeObjectId(episodeNumber) });
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