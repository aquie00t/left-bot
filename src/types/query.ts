export type Track = {
    title: string,
    url: string,
    source: "youtube" | "spotify",
    sp_data?: string,
    stream_url?: string
};