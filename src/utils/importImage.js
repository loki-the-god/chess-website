export function getImageURL(path) {
    return new URL(path, import.meta.url).href;
}