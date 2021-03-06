import readComputerChroniclesCsvItemsFile from "./ComputerChroniclesCsvItemGenerator";
import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";
import { connectToDatabase } from "./connectToDatabase";

async function main() {
    if (process.argv.length != 3) {
        console.error(`Usage: ${process.argv[0]} ${process.argv[1]} <path-to-csv>`);
        process.exit(1);
    }
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);

    try {
        console.log("WIPE");
        await episodeDb.wipe();
    } catch (err) {
        console.log((err as Error).message);
    }

    const filePath = process.argv[2];

    const generator = readComputerChroniclesCsvItemsFile(filePath);

    for await (let episode of generator) {
        console.log(`Inserting episode ${episode.episodeNumber}`);
        try {
            await episodeDb.insertEpisode(episode);
        } catch (err) {
            console.log((err as Error).message);
        }
    }
}

main();