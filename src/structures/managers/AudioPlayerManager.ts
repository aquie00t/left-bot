import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { Track } from "../../types/query";
import play from 'play-dl';
import QueueManager from "./QueueManager";

export default class AudioPlayerManager {
    public discordPlayer!: AudioPlayer;
    private readonly queueManager: QueueManager;
    public constructor(queueManager: QueueManager)
    {
        this.queueManager = queueManager;
    }
    public createDiscordAudioPlayer(): AudioPlayer
    {
        this.discordPlayer = createAudioPlayer();
        this.initializeEvents();
        return this.discordPlayer; 
    }

    public async play(track: Track): Promise<void>
    {
        const stream = await play.stream(track.url);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        this.discordPlayer.play(resource);
    }

    private initializeEvents(): void 
    {
        this.discordPlayer.on(AudioPlayerStatus.Idle, this.onIdle.bind(this));
    }

    public get playing(): boolean
    {
        return this.discordPlayer.state.status == AudioPlayerStatus.Playing;
    } 
    //#region Events
    private onIdle(): void {
        console.log("Audio Player Idle");
        this.queueManager.trackIndex += 1;
        console.log(this.queueManager.trackIndex);
        if(this.queueManager.hasTrack(this.queueManager.trackIndex))
        {
            this.play(this.queueManager.tracks[this.queueManager.trackIndex]);
        }
    }
    //#endregion


}