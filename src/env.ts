import { config } from "dotenv";

export function getEnvFile(nodeEnv: string | undefined): { path: string; } | undefined {
    if (nodeEnv?.toUpperCase() == "TESTING") return { path: ".test.env" };
    return undefined;
}

config(getEnvFile(process.env.NODE_ENV));