import { ComputerChroniclesEpisodeMetadata, computerChroniclesGuestToString } from "./ComputerChroniclesEpisodeMetadata";

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
        diffs.push(`No Audio changed from ${ep1.issues?.noAudio} to ${ep2.issues?.noAudio}`);
    if (ep1.issues?.videoIssues !== ep2.issues?.videoIssues)
        diffs.push(`Video issues changed from ${ep1.issues?.videoIssues} to ${ep2.issues?.videoIssues}`);
    if (ep1.airingDate !== ep2.airingDate)
        diffs.push(`Airing date changed from ${ep1.airingDate} to ${ep2.airingDate}`);
    if (ep1.status !== ep2.status)
        diffs.push(`Status changed from ${ep1.status} to ${ep2.status}`);
    if (ep1.randomAccess?.join() !== ep2.randomAccess?.join())
        diffs.push(`Random Access files changed`);
    if (`${ep1.randomAccessHost?.name} | ${ep1.randomAccessHost?.role}` !== `${ep2.randomAccessHost?.name} | ${ep2.randomAccessHost?.role}`)
        diffs.push(`Random Access Host changed from ${ep1.randomAccessHost?.name} | ${ep1.randomAccessHost?.role} to ${ep2.randomAccessHost?.name} | ${ep2.randomAccessHost?.role}`);
    if (ep1.notes !== ep2.notes)
        diffs.push(`Notes changed`);

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
            diffs.push(`Host changed from ${computerChroniclesGuestToString(ep1.host)} to ${ep2.host?.name} | ${ep2.host?.role}`);

        const coHostsDiff = getArrayDiff(
            ep1.coHosts.map((chHost) => `${computerChroniclesGuestToString(chHost)}`),
            ep2.coHosts.map((chHost) => `${computerChroniclesGuestToString(chHost)}`));
        if (coHostsDiff.added)
            diffs.push(`Co-Hosts added: ${coHostsDiff.added.join(', ')}`);
        if (coHostsDiff.removed)
            diffs.push(`Co-Hosts removed: ${coHostsDiff.removed.join(', ')}`);

        const guestsDiff = getArrayDiff(
            ep1.guests.map((guest) => `${computerChroniclesGuestToString(guest)}`),
            ep2.guests.map((guest) => `${computerChroniclesGuestToString(guest)}`));
        if (guestsDiff.added)
            diffs.push(`Guests added: ${guestsDiff.added.join(', ')}`);
        if (guestsDiff.removed)
            diffs.push(`Guests removed: ${guestsDiff.removed.join(', ')}`);

        const locationsDiff = getArrayDiff(
            ep1.locations.map((location) => `${location.name} | ${location.location}`),
            ep2.locations.map((location) => `${location.name} | ${location.location}`));
        if (locationsDiff.added)
            diffs.push(`Locations added: ${locationsDiff.added.join(', ')}`);
        if (locationsDiff.removed)
            diffs.push(`Locations removed: ${locationsDiff.removed.join(', ')}`);

        const productsDiff = getArrayDiff(
            ep1.featuredProducts.map((product) => `${product.company} | ${product.product}`),
            ep2.featuredProducts.map((product) => `${product.company} | ${product.product}`));
        if (productsDiff.added)
            diffs.push(`Featured products added: ${productsDiff.added.join(', ')}`);
        if (productsDiff.removed)
            diffs.push(`Featured products removed: ${productsDiff.removed.join(', ')}`);

        const tagsDiff = getArrayDiff(ep1.tags, ep2.tags);
        if (tagsDiff.added)
            diffs.push(`Tags added: ${tagsDiff.added.join(', ')}`);
        if (tagsDiff.removed)
            diffs.push(`Tags removed: ${tagsDiff.removed.join(', ')}`);

        return diffs;
    }
}