import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";
import { connectToDatabase } from "./connectToDatabase";

async function main() {
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);

    const eps = await episodeDb.getAllEpisodes();

    const companies = new Set<string>();


    const prefixes:RegExp[] = [
        /^(?:Former )?(?:Founder|Co-founder) of (?:the )?/,
        /^Assistant Division Chief at /,
        /^Professor at /,
        /^Attorney at /,
        /^District Manager at /,
        /^Leader of (?:the )?/,
        /^CEO of /,
        /^CFO of /,
        /^COO of /,
        /^Creator of /,
        /^(?:Former )?(?:Senior )?(?:Vice )?President(?: of [\w\s]+)? (?:of|at) /,
        /^Author of /,
        /^Head of computer research at /,
        /^Chairman of (?:the )?/,
        /^(?:Senior Technology )?Editor(?: in Chief)? (?:of|for|at) /,
        /^Product Manager at /,
        /^Product Manager of /,
        /^Developer of /,
        /^Developer at /,
        /^(?:Acting )?Director(?: of [\w\s]+)? at /,
        /^Director of /,
        /^Publisher of /,
        /^Manager (?:of [\w\s]+ )?at /,
        /^Writer for /,
        /^Sysop of (?:the )?/,
        /^Operator of (?:the )?/,
    ];

    const getCompanyName = (text: string) => {
        for (let prefix of prefixes) {
            if (prefix.test(text)) {
                return text.replace(prefix, "");
            }
        }
        return text;
    };


    for (let ep of eps) {
        if (!ep.isReRun) {
            const epUrl = `https://computerchronicles.karpour.net/?ep=${ep.episodeNumber}`;
            let changes: string[] = [];
            ep.featuredProducts.forEach(product => {
                if (product.company) companies.add(getCompanyName(product.company));
            });
            ep.guests.forEach(guest => {
                if (guest.role) companies.add(getCompanyName(guest.role));
            });
        }
    }
    console.log(Array.from(companies).sort().join('\n'));
    process.exit(1);
}

main();