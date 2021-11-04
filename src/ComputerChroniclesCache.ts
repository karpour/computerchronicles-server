import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";
import {
    ComputerChroniclesFeaturedProduct,
    computerChroniclesFeaturedProductToString,
    ComputerChroniclesGuest,
    computerChroniclesGuestToString,
    ComputerChroniclesLocation,
    computerChroniclesLocationToString,
    ComputerChroniclesOriginalEpisodeMetadata
} from "./ComputerChroniclesEpisodeMetadata";
import { validatePositiveInteger } from "./validatePositiveInteger";



type CacheMap<T> = Map<string, T>;

export default class ComputerChroniclesCache {
    private guestCache!: CacheMap<ComputerChroniclesGuest>;
    private coHostCache!: CacheMap<ComputerChroniclesGuest>;
    private featuredProductCache!: CacheMap<ComputerChroniclesFeaturedProduct>;
    private locationCache!: CacheMap<ComputerChroniclesLocation>;
    private tagsCache!: string[];


    public constructor(private episodeDb: ComputerChroniclesEpisodeDb, rebuildIntervalSeconds?: number) {
        if (rebuildIntervalSeconds !== undefined && validatePositiveInteger(rebuildIntervalSeconds)) {
            console.log(`Setting rebuild interval to ${rebuildIntervalSeconds} seconds`);
            setInterval(() => this.rebuildCache(), rebuildIntervalSeconds * 1000);
        }
        this.rebuildCache();
    }

    public async rebuildCache() {
        console.log(`Rebuilding cache`);
        const episodes = await this.episodeDb.getAllEpisodes();
        // CoHosts
        this.coHostCache = new Map();
        this.guestCache = new Map();
        this.featuredProductCache = new Map();
        this.locationCache = new Map();
        this.tagsCache = [];

        for (let episode of episodes) {
            if (!episode.isReRun) {
                this.addEpisode(episode);
            }
        }
    }

    public addEpisode(episode: ComputerChroniclesOriginalEpisodeMetadata) {
        this.addCoHosts(episode.coHosts);
        this.addGuests(episode.guests);
        this.addFeaturedProducts(episode.featuredProducts);
        this.addLocations(episode.locations);
        this.addTags(episode.tags);
    }

    public addCoHosts(coHosts: ComputerChroniclesGuest[]) {
        coHosts.forEach(coHost => this.coHostCache.set(computerChroniclesGuestToString(coHost), coHost));
    }

    public addGuests(guests: ComputerChroniclesGuest[]) {
        guests.forEach(guest => this.guestCache.set(computerChroniclesGuestToString(guest), guest));

    }
    public addFeaturedProducts(featuredProducts: ComputerChroniclesFeaturedProduct[]) {
        featuredProducts.forEach(product => this.featuredProductCache.set(computerChroniclesFeaturedProductToString(product), product));

    }
    public addLocations(locations: ComputerChroniclesLocation[]) {
        locations.forEach(location => this.locationCache.set(computerChroniclesLocationToString(location), location));
    }

    public addTags(tags: string[]) {
        tags.forEach(tag => {
            if (!tag) return;
            if (!this.tagsCache.includes(tag.toLowerCase())) this.tagsCache.push(tag.toLowerCase());
        });
    }

    public get coHosts(): ComputerChroniclesGuest[] {
        return Array.from(this.coHostCache.values());
    }
    public get guests(): ComputerChroniclesGuest[] {
        return Array.from(this.guestCache.values());
    }
    public get featuredProducts(): ComputerChroniclesFeaturedProduct[] {
        return Array.from(this.featuredProductCache.values());
    }
    public get locations(): ComputerChroniclesLocation[] {
        return Array.from(this.locationCache.values());
    }
    public get tags(): string[] {
        return this.tagsCache;
    }
};
