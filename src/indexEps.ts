import { ObjectId } from "mongodb";
import readComputerChroniclesCsvItemsFile from "./ComputerChroniclesCsvItemGenerator";
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
    if (process.argv.length != 3) {
        console.error(`Usage: ${process.argv[0]} ${process.argv[1]} <path-to-csv>`);
        process.exit(1);
    }
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);
    console.log("WIPE");
    await episodeDb.wipe();


    const filePath = process.argv[2];

    const generator = readComputerChroniclesCsvItemsFile(filePath);

    for await (let episode of generator) {
        console.log(`Inserting episode ${episode.episodeNumber}`)
        await episodeDb.insertEpisode(episode);
    }
}

main();