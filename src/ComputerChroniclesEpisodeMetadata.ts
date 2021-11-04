export type ComputerChroniclesGuest = {
    name: string,
    role?: string;
};

export function computerChroniclesGuestToString(guest: ComputerChroniclesGuest): string {
    return `${guest.name}${guest.role ? " | " + guest.role : ""}`;
}

export type ComputerChroniclesFeaturedProduct = {
    company?: string;
    product: string,
};

export function computerChroniclesFeaturedProductToString(product: ComputerChroniclesFeaturedProduct): string {
    return `${product.company ? product.company + " | " : ""}${product.product}`;
}

export type ComputerChroniclesLocation = {
    name: string;
    location?: string;
};

export function computerChroniclesLocationToString(location: ComputerChroniclesLocation): string {
    return `${location.name}${location.location ? " | " + location.location : ""}`;
}

export type ComputerChroniclesEpisodeIssues = {
    videoIssues?: boolean,
    audioIssues?: boolean,
    noAudio?: boolean,
};

export type ComputerChroniclesEpisodeStatus = "unknown" | "needswork" | "review" | "done";

export type ComputerChroniclesOriginalEpisodeMetadata = {
    iaIdentifier?: string,
    issues?: ComputerChroniclesEpisodeIssues;
    title: string,
    episodeNumber: number,
    isReRun: false,
    airingDate: string,
    productionDate: string,
    description: string,
    host?: ComputerChroniclesGuest,
    coHosts: ComputerChroniclesGuest[],
    guests: ComputerChroniclesGuest[],
    locations: ComputerChroniclesLocation[],
    featuredProducts: ComputerChroniclesFeaturedProduct[],
    tags: string[],
    status: ComputerChroniclesEpisodeStatus;
};

export type ComputerChroniclesRerunEpisodeMetadata = {
    issues?: ComputerChroniclesEpisodeIssues;
    iaIdentifier?: string,
    episodeNumber: number,
    isReRun: true,
    reRunOf: number | null,
    airingDate: string,
    status: ComputerChroniclesEpisodeStatus;
};

export type ComputerChroniclesEpisodeInfo = {
    episodeNumber: number,
    title: string,
} & ({
    isReRun: false,
} | {
    isReRun: true,
    reRunOf: number;
});

export type ComputerChroniclesEpisodeMetadata = ComputerChroniclesOriginalEpisodeMetadata | ComputerChroniclesRerunEpisodeMetadata;
