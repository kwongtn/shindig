export function extractDomain(url: string) {
    return (url.match(
        /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im
    ) ?? ["", ""])[1];
}
