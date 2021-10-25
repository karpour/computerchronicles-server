import { ObjectId } from "mongodb";
import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";
import { ComputerChroniclesEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";
import { connectToDatabase } from "./connectToDatabase";

let exampledata: ComputerChroniclesEpisodeMetadata = {
    issues: {
        videoIssues: false,
        audioIssues: false,
        noAudio: false,
    },
    episodeNumber: 101,
    isReRun: false,
    airingDate: "1970-01-01",
    productionDate: "1970-01-01",
    title: "Japanese PC's",
    description: "This is a description\n\nof the episode",
    host: { name: "Stewart Cheifet" },
    coHosts: [{ name: "Gary Kildall", role: "DRI" }, { name: "George Morrow", role: "Morrow Computing" }],
    locations: [{
        name: "CES 1995",
        location: "Las Vegas"
    }],
    iaIdentifier: "Japanese1985",
    guests: [
        {
            name: "John Miller",
            role: "Microsoft"
        },
        {
            name: "Jack Johnson"
        }
    ],
    featuredProducts: [{
        company: "Microsoft",
        product: "Windows 95"
    }],
    tags: ["Tag1", "Tag2", "Taggy tag"],
};

let exampledata2: ComputerChroniclesEpisodeMetadata = {
    issues: {
        videoIssues: false,
        audioIssues: false,
        noAudio: false,
    },
    episodeNumber: 101,
    isReRun: false,
    airingDate: "1970-01-01",
    productionDate: "1970-01-01",
    title: "bbbbJapanese PC's",
    description: "bbbbThis is a description\n\nof the episode",
    host: { name: "Stewart Cheifet" },
    coHosts: [{ name: "Gary Kildall", role: "DRI" }, { name: "George Morrow", role: "Morrow Computing" }],
    locations: [{
        name: "CES 1995",
        location: "Las Vegas"
    }],
    iaIdentifier: "Japanese1984",
    guests: [
        {
            name: "John Mil3r",
            role: "Microsoft"
        },
        {
            name: "Jack Johnson"
        }
    ],
    featuredProducts: [{
        company: "Microsoft",
        product: "Windows 95"
    }],
    tags: ["Tag1", "Tag2", "Taggy tag"],
};



async function main() {
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);
    console.log("WIPE");
    await episodeDb.wipe();

    await episodeDb.insertEpisode(exampledata);

    await episodeDb.updateEpisode(exampledata2);

    await episodeDb.updateEpisode(exampledata);

    console.log("====LIVEDB===");
    console.log(await episodeDb.getAllEpisodes());
    console.log("====ARCHIVE===");
    console.log(await episodeDb.getAllArchivedEpisodes());
}
main();