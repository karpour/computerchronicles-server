import Parser from "csv-parse";
import { ReadStream } from "fs";
import fs from "fs";
import { connectToDatabase } from "./connectToDatabase";
import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";


type EpisodeDateRevision = {
    episodeNumber: number;
    airingDate: string;
};

export async function* ComputerChroniclesDateItemGenerator(fileStream: ReadStream): AsyncGenerator<EpisodeDateRevision> {
    let csvStream = fileStream.pipe(Parser({
        bom: true,
        columns: true
    }));

    for await (let episode of csvStream) {
        try {
            let epCsv = episode;

            if (epCsv['Revised air date']) {
                yield {
                    episodeNumber: Number(epCsv['Episode Number'].replace('CC', '')),
                    airingDate: epCsv['Revised air date']
                };
            }
        } catch (err) {
            //console.error(item);
            throw err;
        }
    }
}

async function main() {
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);
    const file = "test/epdatesrevised.csv";
    if (!fs.existsSync(file)) throw new Error(`Can't access file "${file}"`);
    const fileReadStream = fs.createReadStream(file);
    const generator = ComputerChroniclesDateItemGenerator(fileReadStream);

    for await (let epData of generator) {
        //console.log(epData);
        let ep = await episodeDb.getEpisode(epData.episodeNumber);
        if (!ep) {
            throw new Error(`No Episode with number ${epData.episodeNumber} found`);
        }
        if (ep.airingDate !== epData.airingDate) {
            //console.log(ep.airingDate)
            //console.log(epData.airingDate)
            console.log(`Updated airing date for episode ${ep.episodeNumber} from "${ep.airingDate}" to "${epData.airingDate}"`);
            ep.airingDate = epData.airingDate;
            console.log(await episodeDb.updateEpisode(ep));
        }
    }
}

main();