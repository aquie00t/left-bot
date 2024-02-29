import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { Track } from "../../types/query";
import play from 'play-dl';
import QueueManager from "./QueueManager";
import IPlayerOptions from "../interfaces/IPlayerOptions";
import Embeds from "../utils/Embeds";
import { Message } from "discord.js";
import ConnectionManager from "./ConnectionManager";
import Player from "../Player";

export default class AudioPlayerManager {
    public discordPlayer!: AudioPlayer;
    private readonly queueManager: QueueManager;
    private readonly options: IPlayerOptions;
    private deletedMessage?: Message;
    private connection: ConnectionManager;
    private idleTimeOut?: NodeJS.Timeout;
    private readonly player: Player;
    public constructor(queueManager: QueueManager, options: IPlayerOptions, connection: ConnectionManager, player: Player)
    {
        this.connection = connection;
        this.queueManager = queueManager;
        this.options = options;
        this.player = player;
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
        this.discordPlayer.on(AudioPlayerStatus.Playing, this.onPlaying.bind(this));
    }

    public get playing(): boolean
    {
        return this.discordPlayer.state.status == AudioPlayerStatus.Playing;
    } 

    public createIdleTimeOut(): void 
    {
        this.idleTimeOut = setTimeout(async() => {
            if(this.connection.connection)
            {
                const inDisconnect = this.connection.connection.disconnect();
                if(inDisconnect)
                    await this.options.textChannel.send({ embeds: [Embeds.defaultEmbed("I  left the audio channel because I was inactive for a long time.")]});
                
                
            }
        }, 50000);
    }
    //#region Events
    private async onIdle(): Promise<void> {
        if(this.deletedMessage)
            if(this.deletedMessage.deletable)
                await this.deletedMessage.delete().catch(e => console.error(e));
        
        if(!this.player.isStoped)
        {
            this.queueManager.trackIndex += 1;
            if(this.queueManager.hasTrack(this.queueManager.trackIndex))
            {
                const track = this.queueManager.tracks[this.queueManager.trackIndex];
                this.play(track);
    
                this.deletedMessage = await this.options.textChannel.send({ embeds: [Embeds.nowPlayingEmbed(track.title)]});
            }
    
        }
       
        if(!this.idleTimeOut)
            this.createIdleTimeOut();
    }

    private onPlaying(): void
    {
        this.player.isStoped = false;
        if(this.connection.timeout)
        {
            console.log("dele");
            clearTimeout(this.connection.timeout);
        }
        if(this.idleTimeOut) {
            console.log("Deleted idle timeout");
            clearTimeout(this.idleTimeOut);
        }  
    }
    //#endregion


}