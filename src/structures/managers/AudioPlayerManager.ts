import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { Track } from "../../types/query";
import play from 'play-dl';
import QueueManager from "./QueueManager";
import IPlayerOptions from "../interfaces/IPlayerOptions";
import Embeds from "../utils/Embeds";
import { Message } from "discord.js";

export default class AudioPlayerManager {
    public discordPlayer!: AudioPlayer;
    private readonly queueManager: QueueManager;
    private readonly options: IPlayerOptions;
    private deletedMessage?: Message;
    public constructor(queueManager: QueueManager, options: IPlayerOptions)
    {
        this.queueManager = queueManager;
        this.options = options;
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
    private async onIdle(): Promise<void> {
        console.log("Audio Player Idle");
        this.queueManager.trackIndex += 1;
        if(this.deletedMessage)
            await this.deletedMessage.delete();
        if(this.queueManager.hasTrack(this.queueManager.trackIndex))
        {
            const track = this.queueManager.tracks[this.queueManager.trackIndex];
            this.play(track);

            this.deletedMessage = await this.options.textChannel.send({ embeds: [Embeds.nowPlayingEmbed(track.title)]});
        }
    }
    //#endregion


}