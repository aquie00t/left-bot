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

    public removeTrack(index: number): Track | undefined
    {
        const trackIndex = index - 1;
        if(this.hasTrack(trackIndex))
        {   
            const removetedTrack = this.tracks.splice(trackIndex, 1)[0];
            return removetedTrack;
        }

        return undefined;
        
    }

    public clear(): void
    {
        this.tracks = [];
    }
}