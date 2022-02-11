import Parser from "csv-parse";
import { ReadStream } from "fs";
import fs from "fs";
import { ComputerChroniclesEpisodeMetadata, ComputerChroniclesEpisodeStatus, ComputerChroniclesFeaturedProduct, ComputerChroniclesGuest, ComputerChroniclesOriginalEpisodeMetadata, ComputerChroniclesRerunEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";

type CsvCCData = {
    iaIdentifier: string,
    iaUrl: string,
    videoIssues: 'TRUE' | 'FALSE',
    audioIssues: 'TRUE' | 'FALSE',
    noAudio: 'TRUE' | 'FALSE',
    youtubeUrl: string,
    status: 'done',
    episodeNumber: string,
    isReRun: 'TRUE' | 'FALSE',
    reRunOf: string,
    airingDate: string,
    title: string,
    description: string,
    iaDescription: string,
    possibleDates: string,
    host: string,
    coHost: string,
    guests: string,
    featuredProducts: string,
    tags: string,
    notes: string,
};

const RegExp_Date_YYYY_MM_DD = /^(\d{4})-?(0[1-9]|1[0-2])-?(0[1-9]|[12]\d|3[01])$/;
/**
 * Validates that a date is in YYYY-MM-DD format
 * @throws Error if date is not valid
 * @param date the tested Date
 */
export function validateDate(date: string): string {
    let s = RegExp_Date_YYYY_MM_DD.exec(date);
    if (s) {
        let _dateString = `${s[1]}-${s[2]}-${s[3]}`;
        let dateObj = new Date(_dateString);
        if (dateObj.getFullYear() == parseInt(s[1]) && dateObj.getMonth() == (parseInt(s[2]) - 1) && dateObj.getDate() == parseInt(s[3])) {
            return date;
        }
    }
    throw new Error(`"${date}" is not a valid date`);
}


export function convertCsvCCData(c: CsvCCData): ComputerChroniclesEpisodeMetadata {
    function parseCCGuest(guest: string): ComputerChroniclesGuest {
        let split = guest.split(",");
        return {
            name: split[0].trim(),
            role: (split[1] ?? "").trim()
        };
    }

    function parseCCProduct(product: string): ComputerChroniclesFeaturedProduct {
        let split = product.split("|");
        if (split.length == 2) {
            return {
                product: split[1].trim(),
                company: split[0].trim(),
            };
        } else {
            return {
                product: product.trim(),
            };
        }
    }

    function mapStatus(status: string): ComputerChroniclesEpisodeStatus {
        switch (status) {
            case "unknown":
                return "unknown";
            case "needs fixing":
                return "needswork";
            case "review":
                return "review";
            case "done":
                return "done";
            default:
                return "unknown";
        }
    }

    if (c.isReRun == "TRUE") {
        const reRun: ComputerChroniclesRerunEpisodeMetadata = {
            airingDate: c.airingDate ? validateDate(c.airingDate) : "",
            episodeNumber: parseInt(c.episodeNumber),
            isReRun: true,
            reRunOf: null,
            status: mapStatus(c.status),
            randomAccess: null,
            randomAccessHost: null,
        };
        if (c.iaIdentifier) reRun.iaIdentifier = c.iaIdentifier;
        if (c.reRunOf) reRun.reRunOf = parseInt(c.reRunOf);
        return reRun;
    } else {
        const originalEp: ComputerChroniclesOriginalEpisodeMetadata = {
            title: c.title,
            episodeNumber: parseInt(c.episodeNumber),
            isReRun: false,
            airingDate: c.airingDate ? validateDate(c.airingDate) : "",
            productionDate: "",
            description: c.description,
            host: c.host ? parseCCGuest(c.host) : { name: "Stewart Cheifet" },
            coHosts: c.coHost.split(';').filter(item => item != "").map(parseCCGuest),
            guests: c.guests.split(';').filter(item => item != "").map(parseCCGuest),
            locations: [],
            featuredProducts: c.featuredProducts.split(',').filter(item => item != "").map(parseCCProduct),
            tags: c.tags.split(',').filter(item => item != "").map(tag => tag.trim()).filter(tag => tag != ""),
            status: mapStatus(c.status),
            randomAccess: null,
            randomAccessHost: null,
        };
        if (c.iaIdentifier) originalEp.iaIdentifier = c.iaIdentifier;
        return originalEp;
    }

}

export async function* ComputerChroniclesCsvItemGenerator(fileStream: ReadStream): AsyncGenerator<ComputerChroniclesEpisodeMetadata> {
    let csvStream = fileStream.pipe(Parser({
        bom: true,
        columns: true
    }));

    for await (let episode of csvStream) {
        try {
            let epCsv = episode as CsvCCData;

            let ep = convertCsvCCData(epCsv);

            yield ep;
        } catch (err) {
            //console.error(item);
            throw err;
        }
    }
}

export default function readComputerChroniclesCsvItemsFile(file: string): AsyncGenerator<ComputerChroniclesEpisodeMetadata> {
    if (!fs.existsSync(file)) throw new Error(`Can't access file "${file}"`);
    const fileReadStream = fs.createReadStream(file);
    return ComputerChroniclesCsvItemGenerator(fileReadStream);
}

