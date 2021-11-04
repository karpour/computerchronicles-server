import { ComputerChroniclesEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";

export default function getEpisodeDiffs(ep1: ComputerChroniclesEpisodeMetadata, ep2: ComputerChroniclesEpisodeMetadata) {
    let diffs: string[] = [];

    const getArrayDiff = (array1: string[], array2: string[]): { added?: string[]; removed?: string[]; } => {
        let result: { added?: string[]; removed?: string[]; } = {};
        let added: string[] = array2.filter(item => !array1.includes(item));
        if (added.length)
            result.added = added;
        let removed: string[] = array1.filter(item => !array2.includes(item));
        if (removed.length)
            result.removed = removed;
        return result;
    };

    if (ep1.iaIdentifier !== ep2.iaIdentifier)
        diffs.push(`Internet archive identifier changed from ${ep1.iaIdentifier} to ${ep2.iaIdentifier}`);
    if (ep1.issues?.audioIssues !== ep2.issues?.audioIssues)
        diffs.push(`Audio issues changed from ${ep1.issues?.audioIssues} to ${ep2.issues?.audioIssues}`);
    if (ep1.issues?.noAudio !== ep2.issues?.noAudio)
        diffs.push(`No Audio changed from ${ep1.issues?.audioIssues} to ${ep2.issues?.audioIssues}`);
    if (ep1.issues?.videoIssues !== ep2.issues?.videoIssues)
        diffs.push(`Video issues changed from ${ep1.issues?.audioIssues} to ${ep2.issues?.audioIssues}`);
    if (ep1.airingDate !== ep2.airingDate)
        diffs.push(`Airing date changed from ${ep1.airingDate} to ${ep2.airingDate}`);
    if (ep1.status !== ep2.status)
        diffs.push(`Status changed from ${ep1.status} to ${ep2.status}`);


    if (ep1.isReRun && ep2.isReRun) {
    } else if (!ep1.isReRun && !ep2.isReRun) {
        if (ep1.title !== ep2.title)
            diffs.push(`Title changed from '${ep1.title}' to '${ep2.title}'`);
        //if (ep1.episodeNumber !== ep2.episodeNumber) diffs.push(``);
        //if (ep1.isReRun !== ep2.isReRun) diffs.push(``);
        if (ep1.productionDate !== ep2.productionDate)
            diffs.push(`Production date changed from ${ep1.productionDate} to ${ep2.productionDate}`);
        if (ep1.description !== ep2.description)
            diffs.push(`Description changed`);
        if (`${ep1.host?.name} | ${ep1.host?.role}` !== `${ep2.host?.name} | ${ep2.host?.role}`)
            diffs.push(`Host changed from ${ep1.host?.name} | ${ep1.host?.role} to ${ep2.host?.name} | ${ep2.host?.role}`);

        const coHostsDiff = getArrayDiff(
            ep1.coHosts.map((chHost) => `${chHost.name} | ${chHost.role}`),
            ep2.coHosts.map((chHost) => `${chHost.name} | ${chHost.role}`));
        if (coHostsDiff.added)
            diffs.push(`Co-Hosts added: ${coHostsDiff.added.join(',')}`);
        if (coHostsDiff.removed)
            diffs.push(`Co-Hosts removed: ${coHostsDiff.removed.join(',')}`);

        const guestsDiff = getArrayDiff(
            ep1.guests.map((guest) => `${guest.name} | ${guest.role}`),
            ep2.guests.map((guest) => `${guest.name} | ${guest.role}`));
        if (guestsDiff.added)
            diffs.push(`Guests added: ${guestsDiff.added.join(',')}`);
        if (guestsDiff.removed)
            diffs.push(`Guests removed: ${guestsDiff.removed.join(',')}`);

        const locationsDiff = getArrayDiff(
            ep1.locations.map((location) => `${location.name} | ${location.location}`),
            ep2.locations.map((location) => `${location.name} | ${location.location}`));
        if (locationsDiff.added)
            diffs.push(`Location added: ${locationsDiff.added.join(',')}`);
        if (locationsDiff.removed)
            diffs.push(`Location removed: ${locationsDiff.removed.join(',')}`);

        const productsDiff = getArrayDiff(
            ep1.featuredProducts.map((product) => `${product.company} | ${product.product}`),
            ep2.featuredProducts.map((product) => `${product.company} | ${product.product}`));
        if (productsDiff.added)
            diffs.push(`Featured products added: ${productsDiff.added.join(',')}`);
        if (productsDiff.removed)
            diffs.push(`Featured products removed: ${productsDiff.removed.join(',')}`);

        const tagsDiff = getArrayDiff(ep1.tags, ep2.tags);
        if (tagsDiff.added)
            diffs.push(`Tags added: ${tagsDiff.added.join(',')}`);
        if (tagsDiff.removed)
            diffs.push(`Tags removed: ${tagsDiff.removed.join(',')}`);

        return diffs;
    }
}

let ep1: ComputerChroniclesEpisodeMetadata = {
    issues: {
        videoIssues: false,
        audioIssues: false,
        noAudio: false,
    },
    episodeNumber: 101,
    isReRun: false,
    airingDate: "1970-01-01",
    productionDate: "1970-01-01",
    title: "Japanese PC's",
    description: "This is a description\n\nof the episode",
    host: { name: "Stewart Cheifet" },
    coHosts: [{ name: "Gary Kildall", role: "DRI" }, { name: "George Morrow", role: "Morrow Computing" }],
    locations: [{
        name: "CES 1995",
        location: "Las Vegas"
    }],
    iaIdentifier: "Japanese1985",
    guests: [
        {
            name: "John Miller",
            role: "Microsoft"
        },
        {
            name: "Jack Johnson"
        }
    ],
    featuredProducts: [{
        company: "Microsoft",
        product: "Windows 95"
    }],
    tags: ["Tag1", "Tag2", "Taggy tag"],
    status: "unknown"
};

let ep2: ComputerChroniclesEpisodeMetadata = {
    issues: {
        videoIssues: false,
        audioIssues: false,
        noAudio: false,
    },
    episodeNumber: 101,
    isReRun: false,
    airingDate: "1970-01-03",
    productionDate: "1970-01-01",
    title: "Taiwanese PC's",
    description: "This is a description\n\nof the episode",
    host: { name: "Stewart Cheifet" },
    coHosts: [{ name: "Gary Kildall", role: "DRI" }, { name: "George Sorrow", role: "Morrow Computing" }],
    locations: [{
        name: "CES 1995",
        location: "Las Vegas"
    },
    {
        name: "CES 2-38",
        location: "Las Vegas"
    }],
    iaIdentifier: "Japanese1986",
    guests: [
        {
            name: "John Miller",
            role: "Microsoft"
        },
        {
            name: "Jack Johnson"
        }
    ],
    featuredProducts: [{
        company: "Microsoft",
        product: "Windows 96"
    }],
    tags: ["Tag1", "Tag2ggg"],
    status: "unknown"
};

//console.log(getEpisodeDiffs(ep1, ep1));