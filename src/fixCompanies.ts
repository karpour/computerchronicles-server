import ComputerChroniclesEpisodeDb from "./ComputerChroniclesEpisodeDb";
import { connectToDatabase } from "./connectToDatabase";

async function main() {
    const db = await connectToDatabase();
    const episodeDb = new ComputerChroniclesEpisodeDb(db);

    const eps = await episodeDb.getAllEpisodes();

    const companies = new Set<string>();

    const replaceRules: { [key: string]: string; } = {
        "U.C. Berkely": "UC Berkeley",
        "VISA International": "VISA",
        "AI Center at SRI International": "SRI",
        "AST": "AST Research, Inc.",
        "BYTE": "Byte Magazine",
        "AST Research": "AST Research, Inc.",
        "Adobe Systems": "Adobe",
        "Aldus Corporation": "Aldus",
        "Digital Equipment Corporation, Technology, Former VP": "Former Vice President at DEC",
        "Director PC Magazine Labs": "Director of PC Magazine Labs",
        "Dragon Systems Inc.": "Dragon Systems",
        "Apple CEO": "CEO of Apple",
        "Assistant Division Chief NASA Ames Research": "Assistant Division Chief at NASA Ames Research",
        "Atari Corporation": "Atari",
        "Attorney, Limbach, Limbach & Sutton": "Attorney at Limbach, Limbach & Sutton",
        "Be Systems": "Be Inc.",
        "Board of Directors National Lan Lab": "National Lan Lab",
        "Byte": "Byte Magazine",
        "Charles Schwab Technology": "Charles Schwab",
        "Commodore International": "Commodore",
        "Computer Chronicles": "The Computer Chronicles",
        "Dataquest Inc. ": "Dataquest",
        "Dialog Info Services": "Dialog Information Services",
        "Dialog": "Dialog Information Services",
        "Diamond": "Diamond Multimedia",
        "Diamond Comp. Sys.": "Diamond Multimedia",
        "Digital Equipment": "DEC",
        "Digital Research": "DRI",
        "District Manager Commodore": "District Manager at Commodore",
        "Dragon": "Dragon Systems",
        "Editor, CD-ROM REVIEW": "Editor at CD-ROM REVIEW",
        "Fortune magazine": "Fortune Magazine",
        "Fortune": "Fortune Magazine",
        "Fractal Software": "Fractal Design",
        "Franklin Publishers": "Franklin",
        "GRiD": "GRiD Systems",
        "Grid": "GRiD",
        "Grid Systems": "GRiD",
        "HP": "Hewlett Packard",
        "Hewlett-Packard": "Hewlett Packard",
        "IBM's manager of software development": "Manager of Software Development at IBM",
        "Kyrocera": "Kyocera",
        "Lucasfilm Games": "LucasArts",
        "Lucasarts": "LucasArts",
        "McDonell Douglas": "McDonnell Douglas",
        "Morrow Computers": "Morrow Computing",
        "President/CEO Magna": "President of Magna",
        "NASA Ames Research": "NASA Ames",
        "Netscape Founder": "Netscape",
        "New York Times technology writer": "New York Times",
        "PC Computing": "PC Computing Magazine",
        "PC Computing magazine": "PC Computing Magazine",
        "PC Week": "PC Week Magazine",
        "PC Week Labs": "PC Week Magazine",
        "PC World": "PC World Magazine",
        "PC World magazine": "PC World Magazine",
        "People's Computer Co": "People's Computer Company",
        "Philips Electronics ": "Philips",
        "Phillips": "Philips",
        "Play": "Play Incorporated",
        "Popular Computing": "Popular Computing Magazine",
        "Popular Photography magazine": "Popular Photography Magazine",
        "President & COO, Nestor": "President of Nestor",
        "President HJC Software": "President of HJC Software",
        "President Innovision Technology": "President of Innovision Technology",
        "President Kreuzer Software": "President of Kreuzer Software",
        "President Natural Microsystems": "President of Natural Microsystems",
        "President PME Labs": "President of PME Labs",
        "President, Microspeed": "President of Microspeed",
        "President, The Lite-Pen Co": "President of The Lite-Pen Company",
        "Priam": "Priam Corporation",
        "Product Manager Lotus Development": "Product Manager at Lotus Development",
        "Product Manager, Numonics": "Product Manager at Numonics",
        "Product Marketing MCI Mail": "MCI",
        "Radio Shack": "RadioShack",
        "Radioshack": "RadioShack",
        "SRI International": "SRI",
        "SRI International, Info. Systems & Admin., VP": "SRI",
        "San Francisco Examiner technology writer": "San Francisco Examiner",
        "Schwab": "Charles Schwab",
        "Silicon Beach": "Silicon Beach Software",
        "Singer-Link": "Singer Link",
        "Softview": "SoftView",
        "Spinnaker": "Spinnaker Software",
        "Stanford": "Stanford University",
        "Stanford Linear Accelerator": "Stanford University",
        "Sun Microsystems": "Sun",
        "Sun Solutions": "SunSolutions",
        "Tany/Radio Shack": "RadioShack",
        "Univ Tokyo": "University of Tokyo",
        "U of Colorado": "University of Colorado",
        "Ventana ": "Ventana",
        "Voyager": "Voyager Company",
        "WordPerfect": "WordPerfect Corporation",
        "Yahoo!": "Yahoo",
        "former found of ARPA": "Former Founder of ARPA",
        "the GIGA Information Group": "The GIGA Information Group",
        "developer of VisiCalc": "Developer of VisiCalc",
        "head of computer research of Lawrence Livermore National Laboratory": "Head of computer research at Lawrence Livermore National Laboratory",
        "president of PKWare": "President of PKWare",
        "president of Stac Electronics": "President of Stac Electronics",
        "conference host": "Conference host",
        "co-founder of Web TV Networks": "Co-founder of Web TV Networks",
        "founder of the Association of Shareware Professionals": "Founder of the Association of Shareware Professionals",
        "leader of the Color Computer User's Group": "Leader of the Color Computer User's Group",
        "operator of the Shareware BBS": "Operator of the Shareware BBS",
        "author of \"Brave New Schools\"": `Author of "Brave New Schools"`,
        "author of \"Exploring the Internet\"": `Author of "Exploring the Internet"`,
        "author of \"The Virtual Community\"": `Author of "The Virtual Community"`,
        "author of \"Zen and the Art of the Internet\"": `Author of "Zen and the Art of the Internet"`,
        "author of How Computers Work": `Author of "How Computers Work"`,
        "author of Peter Coffee Teaches PCs": `Author of "Peter Coffee Teaches PCs"`,
        "author of Using Netscape Communicator": `Author of "Using Netscape Communicator"`,
        "writer for Gamespot.com and Videogames.com": `Writer for Gamespot.com"`,
        "V.P. Systems Engineering Speech Plus": `Vice President of Speech Plus"`,
        "Sun Microsystem": "Sun",
        "Hewlett Packard, PC Group, General Manager": "Hewlett Packard",
        "Former Gavilan V.P.": "Former Vice President at Gavilan",
        "Coleco Insutries, Inc.": "Coleco Industries, Inc.",
        "Businessland Inc.": "Businessland",
        "Berkeley Speech Tech": "Berkeley Speech Technologies",
        "Berkeley Systems Design": "Berkeley Systems",
        "BMUG librarian": "Berkeley Macintosh User Group",
        "Addison Wesley": "Addison-Wesley",
        "Acting Director, SF Division, US Postal Service": "Acting Director of SF Division at USPS",
        "VP, Student Services, De Anza College": "Vice President of Student Services at De Anza College",
        "Director of the IBM Austin Lab": "Director of Austin Lab at IBM",
        "Innovision Technology": "InnoVision Technology",
        "Interplay Productions": "Interplay",
        "Javelin": "Javelin Software",
        "Mac World magazine": "Mac World Magazine",
        "MacWorld": "Mac World Magazine",
        "Micropro": "MicroPro",
        "Author Deluxe Paint III": "Author of Deluxe Paint III",
    };



    for (let ep of eps) {
        if (!ep.isReRun) {
            const epUrl = `https://computerchronicles.karpour.net/?ep=${ep.episodeNumber}`;
            let changes: string[] = [];
            ep.featuredProducts.forEach(product => {

                if (product.company) {
                    if (replaceRules[product.company] != undefined) {
                        changes.push(`  ${product.company} => ${replaceRules[product.company]}`);
                        product.company = replaceRules[product.company];
                    }
                }
                if (product.company) companies.add(`${product.company}`);
                //if (product.company) companies.add(`${product.company} - ${product.product} ............................................... ${epUrl}`);
            });
            ep.guests.forEach(guest => {
                if (guest.role) {
                    if (replaceRules[guest.role] != undefined) {
                        changes.push(`  ${guest.role} => ${replaceRules[guest.role]}`);
                        guest.role = replaceRules[guest.role];
                    }
                }
                if (guest.role) companies.add(`${guest.role}`);
                //if (guest.role) companies.add(`${guest.role} = ${guest.name} ............................................... ${epUrl}`);
            });
            
            if (changes.length) {
                console.log(`CC${ep.episodeNumber} - ${ep.title} -- ${epUrl}\n${changes.join('\n')}\n`);
                let result = await episodeDb.updateEpisode(ep);
                if (result.episodeWasUpdated) {
                    console.log(result.changes.join("\n"));
                } else {
                    console.log("No updates");
                }
            }
        }
    }
    //console.log(Array.from(companies).sort().join('\n'));
    process.exit(0);
}

main();