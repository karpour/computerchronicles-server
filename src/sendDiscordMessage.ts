import requireEnv from "./requireEnv";

import { Client, Intents, TextChannel } from 'discord.js';
import { ComputerChroniclesEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const DISCORD_BOT_TOKEN = requireEnv("DISCORD_BOT_TOKEN");
const DISCORD_CHANGE_LOG_CHANNEL_ID = requireEnv("DISCORD_CHANGE_LOG_CHANNEL_ID");
const PUBLIC_URL = requireEnv("PUBLIC_URL");

var channel: TextChannel | undefined;

// Login to Discord with your client's token
client.login(DISCORD_BOT_TOKEN).then(async () => {
    channel = await client.channels.fetch(DISCORD_CHANGE_LOG_CHANNEL_ID) as TextChannel;
}).catch(err => {
    console.log((err as Error).message);
});

export default function sendDiscordChangeLogMessage(user: string, episode: ComputerChroniclesEpisodeMetadata, changes: string[]) {
    let changesFormatted = changes.map(change => ` • ${change}`).join('\n');
    if (changesFormatted.length > 1800) changesFormatted = `${changesFormatted.slice(0, 1800)}... (truncated)`;
    channel?.send(`${user} changed **Episode ${episode.episodeNumber}${episode.isReRun ? "" : ": " + episode.title}**\n${changesFormatted}\n${PUBLIC_URL}?ep=${episode.episodeNumber}`);
    //console.log(`[DISCORD] ${user} changed **Episode ${episode.episodeNumber}${episode.isReRun ? "" : ": " + episode.title}**\n${changesFormatted}\n${PUBLIC_URL}?ep=${episode.episodeNumber}`);
}