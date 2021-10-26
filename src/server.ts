import requireEnv from "./requireEnv";
import express from "express";
import { connectToDatabase } from "./connectToDatabase";
import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";
import { validatePositiveInteger } from "./validatePositiveInteger";

export const PORT = requireEnv("PORT");

export const STATIC_CONTENT_PATH = requireEnv("STATIC_CONTENT_PATH");

async function main() {
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);

    const app = express();

    app.get('/api/episode/', async (req, res) => {
        res.status(200).send(await episodeDb.getAllEpisodes());
    });

    app.get('/api/episode/:id', async (req, res) => {
        try {
            const episodeNumber: number = validatePositiveInteger(parseInt(req.params.id));
            const episode = await episodeDb.getEpisode(episodeNumber);
            if (episode) {
                res.status(200).send(episode);
                return;
            } else {
                res.status(404).send({ error: `Unable to find matching episode number ${episodeNumber}` });
            }
        } catch (error) {
            res.status(404).send({ error: (error as any).message ?? "Error" });
        }
    });

    app.get('/api/episode/:id/:version', async (req, res) => {
        try {
            const episodeNumber: number = validatePositiveInteger(parseInt(req.params.id));
            const episodeVersion: number = validatePositiveInteger(parseInt(req.params.version));
            const episode = await episodeDb.getEpisode(episodeNumber, episodeVersion);
            if (episode) {
                res.status(200).send(episode);
                return;
            } else {
                res.status(404).send({ error: `Unable to find matching episode number ${episodeNumber} version ${episodeVersion}` });
            }
        } catch (error) {
            res.status(404).send({ error: (error as any).message ?? "Error" });
        }
    });

    app.use("/", express.static(STATIC_CONTENT_PATH));

    app.listen(PORT, async () => {
        console.log(`Listening on port ${PORT}`);
    });

}

main();