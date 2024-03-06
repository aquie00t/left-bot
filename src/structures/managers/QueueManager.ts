import { Track } from "../../types/query";

/**
 * Queue manager class.
 */
export default class QueueManager {
    /** List of tracks in the queue. */
    public tracks: Track[];

    /** Index of the current track. */
    public trackIndex: number;

    /**
     * Constructor.
     */
    public constructor() {
        this.tracks = [];
        this.trackIndex = 0;
    }

    /**
     * Adds a new track to the queue.
     * @param {Track} track - The track to be added.
     * @returns {Track} - The added track.
     */
    public addTrack(track: Track): Track {
        this.tracks.push(track);
        return track;
    }

    /**
     * Checks if a track exists at a certain index.
     * @param {number} index - The index to check.
     * @returns {boolean} - True if there is a track, false otherwise.
     */
    public hasTrack(index: number): boolean {
        return index >= 0 && index < this.tracks.length;
    }

    /**
     * Removes a track from the queue at a specific index.
     * @param {number} index - The index of the track to be removed.
     * @returns {Track | undefined} - The removed track or undefined.
     */
    public removeTrack(index: number): Track | undefined {
        const trackIndex = index - 1;
        if (this.hasTrack(trackIndex)) {
            const removedTrack = this.tracks.splice(trackIndex, 1)[0];
            return removedTrack;
        }

        return undefined;
    }

    /**
     * Clears the queue.
     */
    public clear(): void {
        this.tracks = [];
    }
}
