import requireEnv from "./requireEnv";
import express from "express";
import { connectToDatabase } from "./connectToDatabase";
import { ComputerChroniclesEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";
import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";



export const PORT = requireEnv("PORT");

export const STATIC_CONTENT_PATH = requireEnv("STATIC_CONTENT_PATH");


async function main() {
    console.log("test");
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);

    const app = express();


    app.get('/api/episode/', async (req, res) => {
        res.status(200).send(await episodeDb.getAllEpisodes());
    });

    app.get('/api/episode/:id', async (req, res) => {
        console.log("EP requested")
        const episodeNumber: number = parseInt(req.params.id);
        if (isNaN(episodeNumber)) {
            res.status(400).send({ error: "Not a valid episode id" });
            return;
        }

        try {
            const episode = await episodeDb.getEpisode(episodeNumber);

            if (episode) {
                res.status(200).send(episode);
                return;
            }
        } catch (error) {
            res.status(404).send(`Unable to find matching episode number ${episodeNumber}`);
        }
        res.status(404).send(`Unable to find matching episode number ${episodeNumber}`);
    });

    app.use("/", express.static(STATIC_CONTENT_PATH));

    app.listen(PORT, async () => {
        console.log('listening on port ');
    });

}

main();