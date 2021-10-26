#!/usr/bin/node

import readComputerChroniclesCsvItemsFile from "./ComputerChroniclesCsvItemGenerator";

async function main() {
    if (process.argv.length != 3) {
        console.error(`Usage: ${process.argv[0]} ${process.argv[1]} <path-to-csv>`);
        process.exit(1);
    }

    const filePath = process.argv[2];

    const generator = readComputerChroniclesCsvItemsFile(filePath);

    for await (let episode of generator) {
        console.log(episode);
    }
}
main();