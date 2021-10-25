import requireEnv from "./requireEnv";
import express from "express";
import { connectToDatabase } from "./connectToDatabase";
import { ComputerChroniclesEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";



export const PORT = requireEnv("PORT");

export const STATIC_CONTENT_PATH = requireEnv("STATIC_CONTENT_PATH");


async function main() {
    console.log("test");
    const db = await connectToDatabase();

    const ccEpisodesCollection = db.collection("episodes");

    const app = express();


    app.get('/api/episode/', (req, res) => {
        res.send("All episodes");
    });

    app.get('/api/episode/:id', async (req, res) => {
        const episodeNumber: number = parseInt(req.params.id);
        if (isNaN(episodeNumber)) {
            res.status(400).send({ error: "Not a valid episode id" });
            return;
        }

        try {
            const query: Partial<ComputerChroniclesEpisodeMetadata> = { episodeNumber: episodeNumber };
            const episode = (await ccEpisodesCollection.findOne(query)) as ComputerChroniclesEpisodeMetadata;

            if (episode) {
                res.status(200).send(episode);
            }
        } catch (error) {
            res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
        }

        res.send(`Episode ${episodeNumber}`);
    });

    app.use("/", express.static(STATIC_CONTENT_PATH));

    app.listen(PORT, async () => {
        console.log('listening on port ');
    });

}