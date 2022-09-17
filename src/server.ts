import requireEnv from "./requireEnv";
import express from "express";
import { connectToDatabase } from "./connectToDatabase";
import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";
import { validatePositiveInteger } from "./validatePositiveInteger";
import Users, { UserData } from "./Users";
import AuthTokens from "./AuthTokens";
import ComputerChroniclesCache from "./ComputerChroniclesCache";
import cookieParser from "cookie-parser";
import { ComputerChroniclesOriginalEpisodeMetadata, validateComputerChroniclesMetadata } from "./ComputerChroniclesEpisodeMetadata";
import sendDiscordChangeLogMessage from "./sendDiscordMessage";
import getCompanyName from "./getCompanyName";

export const PORT = requireEnv("PORT");
export const CACHE_REFRESH_IN_SECONDS = validatePositiveInteger(parseInt(requireEnv("CACHE_REFRESH_IN_SECONDS")));

export const STATIC_CONTENT_PATH = requireEnv("STATIC_CONTENT_PATH");

export type LoginStatus = {
    loggedIn: false;
} | {
    loggedIn: true;
    userName: string;
    role: string;
};

async function main() {
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);
    const usersDb = new Users(db);
    const authDb = new AuthTokens(db);

    async function getUser(cookies: { AuthToken?: string; }): Promise<UserData | null> {
        if (cookies.AuthToken) {
            let userName = await authDb.getUserName(cookies.AuthToken);
            if (userName) {
                let userData = await usersDb.getUser(userName);
                if (userData) return userData;
            }
        }
        return null;
    }

    const cache: ComputerChroniclesCache = new ComputerChroniclesCache(episodeDb, CACHE_REFRESH_IN_SECONDS);

    const app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));


    app.get('/computerchronicles_metadata.ndjson', async (req, res) => {
        res.status(200);
        res.attachment("computerchronicles_metadata.ndjson");
        res.type("application/x-ndjson");
        const episodes = await episodeDb.getAllEpisodes();
        for (let episode of episodes) {
            res.write(JSON.stringify(episode));
            res.write('\n');
        }
        res.end();
    });

    app.get('/computerchronicles_metadata.json', async (req, res) => {
        res.status(200);
        res.attachment("computerchronicles_metadata.json");
        res.type("application/json");
        res.send(await episodeDb.getAllEpisodes());
    });

    app.get('/episodelist.csv', async (req, res) => {
        res.status(200);
        res.attachment("episodelist.csv");
        res.type("text/csv");
        const eps = await episodeDb.getAllEpisodes();
        eps.forEach(ep => {
            res.write(`CC${ep.episodeNumber},"${ep.isReRun ? 'Re-run of ' + ep.reRunOf ?? "UNKNOWN" : ep.title}",${ep.productionDate ?? ""},${ep.airingDate}\n`);
        });
        res.end();
    });

    app.get('/brokenepisodes', async (req, res) => {
        const episodes: ComputerChroniclesOriginalEpisodeMetadata[] = (await episodeDb.getAllEpisodes())
            .filter(episode => !episode.isReRun && (!episode.iaIdentifier || episode.issues?.audioIssues || episode.issues?.videoIssues || episode.issues?.noAudio)) as ComputerChroniclesOriginalEpisodeMetadata[];
        res.contentType('text/plain');
        for (let episode of episodes) {
            const ccNumber = `CC${episode.episodeNumber}`.padEnd(6);
            res.write(`${ccNumber} ${episode.title}`);
            if (!episode.iaIdentifier)
                res.write(` [missing]`);
            res.write('\n');
        }
        res.end();
    });

    app.get('/companies', async (req, res) => {
        const episodes: ComputerChroniclesOriginalEpisodeMetadata[] = (await episodeDb.getAllEpisodes())
            .filter(episode => !episode.isReRun) as ComputerChroniclesOriginalEpisodeMetadata[];
        res.contentType('text/plain');
        
        const companies = new Set<string>();
        for (let ep of episodes) {
            if (!ep.isReRun) {
                ep.featuredProducts.forEach(product => {
                    if (product.company) companies.add(getCompanyName(product.company));
                });
                ep.guests.forEach(guest => {
                    if (guest.role) companies.add(getCompanyName(guest.role));
                });
            }
        }
        res.write(Array.from(companies).sort().join('\n'));
        res.end();
    });

    app.get('/api/episodes/', async (req, res) => {
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

    app.put('/api/episode/:id', async (req, res) => {
        let user = await getUser(req.cookies);
        if (!user) {
            res.status(403).send({
                error: "Please log in"
            });
            return;
        }

        let episode = validateComputerChroniclesMetadata(req.body);
        episode.editedBy = user.name;
        if (!episode.isReRun && !episode.host) episode.host = null;


        try {
            let result = await episodeDb.updateEpisode(episode);

            if (result.episodeWasUpdated) {
                console.log(`${user.name} made the following changes to episode ${episode.episodeNumber}:`);
                console.log(result.changes.map(change => ` - ${change}`).join('\n'));
                console.log('');

                sendDiscordChangeLogMessage(user.name, episode, result.changes);
            } else {
                console.log(`${user.name} submitted episode ${episode.episodeNumber} but no changes were detected\n`);
            }

            res.status(200).send({ success: true });
            return;
        } catch (err) {
            console.error(`[error] ${user.name} submitted episode ${episode.episodeNumber}`);
            console.error((err as Error).message);
            res.status(400).send({
                error: (err as Error).message
            });
        }
    });

    // Guests
    app.get('/api/guests/', async (req, res) => {
        res.status(200).send(cache.guests);
    });

    // CoHosts
    app.get('/api/cohosts/', async (req, res) => {
        res.status(200).send(cache.coHosts);
    });

    // Featured Products
    app.get('/api/featuredproducts/', async (req, res) => {
        res.status(200).send(cache.featuredProducts);
    });

    // Locations
    app.get('/api/locations/', async (req, res) => {
        res.status(200).send(cache.locations);
    });

    // Tags
    app.get('/api/tags/', async (req, res) => {
        res.status(200).send(cache.tags);
    });

    app.get('/api/loginstatus/', async (req, res) => {
        let user = await getUser(req.cookies);

        let status!: LoginStatus;
        if (user) {
            status = {
                loggedIn: true,
                userName: user.name,
                role: user.role
            };
        } else {
            status = {
                loggedIn: false
            };
        }

        res.status(200).send(status);
    });

    app.get('/logout/', async (req, res) => {
        let user = await getUser(req.cookies);
        if (user) console.log(`${user.name} logged out`);
        res.clearCookie('AuthToken');
        res.status(200).send("Logged out.");
    });

    app.post('/login', async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await usersDb.getUserAuth(username, password);
            if (user) {
                const authToken: string = await authDb.getNewToken(user.name);
                res.cookie('AuthToken', authToken, { expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365)) });
                console.log(`${username} logged in`);

                res.redirect('/');
            } else {
                res.status(400).send(`Incorrect username or password`);
            }
        } catch (err) {
            res.status(400).send(`Error while logging in`);
        }
    });

    app.use("/", express.static(STATIC_CONTENT_PATH));

    app.listen(PORT, async () => {
        console.log(`Listening on port ${PORT}`);
    });

}

main();