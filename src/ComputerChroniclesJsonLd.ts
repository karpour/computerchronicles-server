import { TVEpisode, TVSeries, Event, Place, Person, Product } from 'schema-dts';


import { ComputerChroniclesEpisodeMetadata, ComputerChroniclesOriginalEpisodeMetadata, ComputerChroniclesRerunEpisodeMetadata } from './ComputerChroniclesEpisodeMetadata';



function getEpisodeUrl(episode: ComputerChroniclesEpisodeMetadata): string {
    return `https://computerchronicles.com/episodes/CC${episode.episodeNumber}`;
}

function getOriginalEpisode(episode: ComputerChroniclesRerunEpisodeMetadata): ComputerChroniclesOriginalEpisodeMetadata {
    return undefined as any as ComputerChroniclesOriginalEpisodeMetadata;
}

/**
 * @see https://schema.org/TVEpisode
 */
class ComputerChroniclesJsonLd {

    static getSeries(): TVSeries {
        return {
            "@type": "TVSeries",
            author: {
                "@type": "Person",
                name: "Stewart Cheifet"
            },
            name: "Computer Chronicles",
            startDate: "",
            endDate: ""
        };
    }

    static getEvents(episode: ComputerChroniclesOriginalEpisodeMetadata): Event[] {
        return episode.locations.filter(location => location.event).map(location => ({
            "@type": "Event",
            name: location.event,
            location: {
                "@type": "Place",
                name: location.name,
                address: location.location
            }
        }));
    }

    static getLocations(episode: ComputerChroniclesOriginalEpisodeMetadata): Place[] {
        return episode.locations.filter(location => location.event === undefined).map(location => ({
            "@type": "Place",
            name: location.name,
            address: location.location
        }));
    }

    static getProducts(episode: ComputerChroniclesOriginalEpisodeMetadata): Product[] {
        return episode.featuredProducts.map(product => ({
            "@type": "Product",
            name: product.product,
            manufacturer: product.company && ({
                "@type": "Organization",
                name: product.company
            }),
        }));
    }

    static getPeople(episode: ComputerChroniclesOriginalEpisodeMetadata): Person[] {
        const hosts: Person[] = [];
        if (episode.host) hosts.push({
            "@type": "Person",
            name: episode.host.name,
            worksFor: episode.host.company ?? "Computer Chronicles",
            jobTitle: "Host"
        });
        const coHosts: Person[] = episode.coHosts.map(coHost => ({
            "@type": "Person",
            name: coHost.name,
            worksFor: coHost.company ?? "Computer Chronicles",
            jobTitle: "Co-host"
        }));
        const guests: Person[] = episode.guests.map(guest => ({
            "@type": "Person",
            name: guest.name,
            worksFor: guest.company,
            jobTitle: guest.role
        }));
        return [
            ...hosts,
            ...coHosts,
            ...guests
        ];
    }

    static createTvEpisode(episode: ComputerChroniclesEpisodeMetadata): TVEpisode {
        const tvEpisode: TVEpisode = {
            "@type": "TVEpisode",
            countryOfOrigin: "USA",
        };
        if (episode.isReRun) {
            const originalEpisode = getOriginalEpisode(episode);
            return {
                ...tvEpisode,
                name: `Re-run of ${originalEpisode.title}`,
                position: `${episode.episodeNumber}`,
                //description: "Description of the re-run episode",
                isPartOf: {
                    "@type": "TVEpisode",
                    name: originalEpisode.title,
                    url: getEpisodeUrl(originalEpisode)
                }
            };
        } else {
            return {
                ...tvEpisode,
                name: episode.title,
                producer: {
                    "@type": "Person",
                    name: "Stewart Cheifet",
                },
                about: ComputerChroniclesJsonLd.getProducts(episode),
                description: episode.description,
                actor: ComputerChroniclesJsonLd.getPeople(episode),
                //"position": episode.absoluteNumber,
                position: `${episode.episodeNumber}`,
                publication: [
                    {
                        "@type": "BroadcastEvent",
                        startDate: episode.airingDate
                    }
                ],
                locationCreated: ComputerChroniclesJsonLd.getLocations(episode),
                recordedAt: ComputerChroniclesJsonLd.getEvents(episode),
                url: getEpisodeUrl(episode),
                video: {
                    "@type": "VideoObject",
                    // TODO
                    url: "TODO"
                }
            };
        }
    }
}

export default ComputerChroniclesJsonLd;