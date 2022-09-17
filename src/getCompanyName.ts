const prefixes: RegExp[] = [
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
    /^Publisher of /,
    /^Manager (?:of [\w\s]+ )?at /,
    /^Writer for /,
    /^Sysop of (?:the )?/,
    /^Operator of (?:the )?/,
];

export default function getCompanyName(text: string): string {
    for (let prefix of prefixes) {
        if (prefix.test(text)) {
            return text.replace(prefix, "");
        }
    }
    return text;
};