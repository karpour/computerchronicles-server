export type CompanyProfile = {
    name: string;
    aliases: string[];
    address?: string;
    wikiUrl?: string;
    url?: string;
};

const profiles: CompanyProfile[] = [
    {
        name: "Apple",
        aliases: ["Apple, Inc.", "Apple Computer, Inc."],
        url: "www.apple.com",
        wikiUrl: "https://en.wikipedia.org/wiki/Apple_Inc."
    },
    {
        name: "Cybersmith",
        aliases: [],
        address: "Cybersmith Harvard Square\n42 Church Street\nCambridge, MA 02138\nUSA"
    },
    {
        name: "VIS Interactive Media Productions Ltd.",
        aliases: [],
        address: "1 Harrison Road\nDundee Tayside, DD2 3SN\nUnited Kingdom"
    }
];