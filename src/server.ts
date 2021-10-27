import requireEnv from "./requireEnv";
import express from "express";
import { connectToDatabase } from "./connectToDatabase";
import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";
import { validatePositiveInteger } from "./validatePositiveInteger";
import Users from "./Users";
import AuthTokens from "./AuthTokens";
import ComputerChroniclesCache from "./ComputerChroniclesCache";
import cookieParser from "cookie-parser";

export const PORT = requireEnv("PORT");

export const STATIC_CONTENT_PATH = requireEnv("STATIC_CONTENT_PATH");

async function main() {
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);
    const usersDb = new Users(db);
    const authDb = new AuthTokens(db);

    const cache: ComputerChroniclesCache = new ComputerChroniclesCache(episodeDb, 3600);

    const app = express();
    app.use(cookieParser());
    app.use(express.urlencoded({
        extended: true
    }));

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

    app.put('/api/episode/:id', async (req, res) => {
        console.log(req.headers);
        res.status(200);
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

    app.get('/logout/', async (req, res) => {
        console.log(req.cookies);
    });

    app.get('/login', async (req, res) => {
        res.status(200).send(`<!DOCTYPE html>
        <html>
        <head><title>Login</title></head>
        <h1>Login</h1> 
        <form action="#" method="post">
                <div><label>Username:</label>
                <input type="text" placeholder="Enter Username" name="username" required></div>
                <div><label>Password:</label>
                <input type="password" placeholder="Enter Password" name="password" required></div>
                <button type="submit">Login</button>
        </form>
        <body>
        </body>
        </html>`);
    });


    app.post('/login', async (req, res) => {
        //console.log(req.body);
        const { username, password } = req.body;

        try {
            const user = await usersDb.getUserAuth(username, password);
            if (user) {
                const authToken: string = await authDb.getNewToken(user.name);
                res.cookie('AuthToken', authToken);

                // Redirect user to the protected page
                if (user.role == "admin") {
                    res.redirect('/?admin=1');
                } else {
                    res.redirect('/');
                }
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