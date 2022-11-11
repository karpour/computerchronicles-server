#!/usr/bin/node

import ComputerChroniclesEpisodeDb from "../ComputerChroniclesEpisodeDb";
import { ComputerChroniclesEpisodeMetadata } from "../ComputerChroniclesEpisodeMetadata";
import { connectToDatabase } from "../connectToDatabase";

const newEpisode: ComputerChroniclesEpisodeMetadata = {
    "title": "Airline Magazine Software",
    "episodeNumber": 1422,
    "isReRun": false,
    "airingDate": "1997-02-18",
    "productionDate": "",
    "description": "",
    "host": {
        "name": "Stewart Cheifet"
    },
    "coHosts": [],
    "guests": [],
    "locations": [],
    "featuredProducts": [],
    "tags": [],
    "status": "unknown",
    "randomAccess": null,
    "randomAccessHost": null,
    "editedBy": "karpour",
    "notes": "1997-02-22 Airline Magazine Software 1422 WITF\n according to WITF program guide",
    iaIdentifier: null
}
async function main() {
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);
    let result = await episodeDb.updateEpisode(newEpisode);
    console.log(result);
}

main();