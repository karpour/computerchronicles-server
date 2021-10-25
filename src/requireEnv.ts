import './env';
/**
 * Returns the value of a process.env variable, throws an Error if variable doesn't exist
 * @param envVariableName Name of the environment variable to retrieve
 */
export default function requireEnv(envVariableName: string): string {
    let v = process.env[envVariableName];
    if (v != undefined) {
        return v;
    }
    throw new Error(`Environment variable ${envVariableName} is not defined, define in .env`);
}