import { Track } from "../../types/query";

export default class QueueManager {
    public tracks: Track[];
    public trackIndex: number;

    public constructor()
    {
        this.tracks = [];
        this.trackIndex = 0;
    }

    public addTrack(track: Track): Track
    {
        this.tracks.push(track);
        return track;
    }

    public hasTrack(index: number): boolean
    {
        return index >= 0 && index < this.tracks.length;
    }
}