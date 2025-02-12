#!/usr/bin/node

import ComputerChroniclesEpisodeDb from "../ComputerChroniclesEpisodeDb";
import { ComputerChroniclesEpisodeMetadata } from "../ComputerChroniclesEpisodeMetadata";
import { connectToDatabase } from "../connectToDatabase";

const newEpisode: ComputerChroniclesEpisodeMetadata =
{
  "airingDate": "2000-07-18",
  "productionDate": "",
  "episodeNumber": 1744,
  "isReRun": true,
  "reRunOf": 1534,
  "status": "unknown",
  "randomAccess": null,
  "randomAccessHost": null,
  "editedBy": "karpour",
  "iaIdentifier": null
};
async function main() {
  const db = await connectToDatabase();
  const episodeDb = new ComputerChroniclesEpisodeDb(db);
  let result = await episodeDb.updateEpisode(newEpisode, true);
  console.log(result);
}

main();