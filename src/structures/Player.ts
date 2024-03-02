import { AudioPlayerStatus, CreateVoiceConnectionOptions, JoinVoiceChannelOptions, createAudioResource } from "@discordjs/voice";
import PlayerManager from "./managers/PlayerManager";
import ConnectionManager from "./managers/ConnectionManager";
import QueryManager from "./managers/QueryManager";
import { Track } from "../types/query";
import AudioPlayerManager from "./managers/AudioPlayerManager";
import QueueManager from "./managers/QueueManager";
import IPlayerOptions from "./interfaces/IPlayerOptions";
import LeftClient from "./LeftClient";
import play from 'play-dl';
import { VoiceChannel } from "discord.js";
import Embeds from "./utils/Embeds";

export default class Player
{
    private readonly players: PlayerManager;
    private readonly connection: ConnectionManager;
    private readonly audioPlayer: AudioPlayerManager;
    private readonly queue: QueueManager;
    public readonly options: IPlayerOptions;
    private readonly client: LeftClient;
    private readonly queryManager: QueryManager;
    public aloneTimeInterval?: NodeJS.Timeout; 
    public isStoped: boolean;
    public constructor(client: LeftClient, players: PlayerManager, options: IPlayerOptions)
    {
        this.players = players;
        this.options = options;
        this.client = client;
        this.queue = new QueueManager;
        this.connection = new ConnectionManager(this.players, this);
        this.audioPlayer = new AudioPlayerManager(this.queue, options, this.connection, this);
        this.queryManager = new QueryManager();
        this.aloneTimeInterval = undefined;
        this.isStoped = false;
    }

    public async join(config: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): Promise<void>
    {
        this.connection.createConnection(config);
        this.audioPlayer.createDiscordAudioPlayer();
        this.connection.subsribe(this.audioPlayer.discordPlayer);

        this.aloneTimeInterval = setInterval(async() => {
            if(this.connection.connection)
            {
            
                const botVoiceChannel = this.client.channels.cache.get(this.connection.connection.joinConfig.channelId!) as VoiceChannel;
                if(botVoiceChannel)
                {
                    if(botVoiceChannel.members.size == 1) {
                        await this.options.textChannel.send({ embeds: [Embeds.defaultEmbed("I left because I was alone in the voice channel.")]});
                        this.connection.connection.disconnect();
                    }
                }
            }
            
        }, 50000);

        await this.queryManager.setToken();
    }

    public hasConnect(guildId: string): boolean
    {
        return this.connection.hasConnection(guildId);
    }

    public leave(guildId: string): void
    {
        if(!this.connection.hasConnection(guildId))
            throw "You can't cut what doesn't exist.";
        this.connection.connection!.disconnect();
    }

    public async play(track: Track): Promise<void>
    {
        await this.audioPlayer.play(track);
    }
    public async search(query: string): Promise<Track[]> {
        const validate = await play.validate(query);

        switch(validate)
        {
            case "yt_playlist":
            case "yt_video":
            case "search":
                return await this.queryManager.youtubeQuery(query);
            case "sp_album":
            case "sp_playlist":
            case "sp_track":
                return await this.queryManager.spotifyQuery(query);
            default: 
                return [];
        }
    }

    public addTrack(track: Track): void
    {
        this.queue.addTrack(track);
    }

    public get playing(): boolean 
    {
        return this.audioPlayer.playing;
    }

    public async playFromQueue(trackIndex: number = this.queue.trackIndex): Promise<void>
    {
        if(this.queue.hasTrack(trackIndex))
        {
            await this.audioPlayer.play(this.queue.tracks[trackIndex]);
            return;
        }
        
        this.queue.trackIndex = this.queue.tracks.length - 1;
        await this.audioPlayer.play(this.queue.tracks[this.queue.trackIndex]);
        
    }

    public async skip(): Promise<void>
    {
        this.isStoped = false;
        if(this.audioPlayer.playing)
        {
            this.audioPlayer.discordPlayer.stop();
            return;
        }
        
        this.audioPlayer.discordPlayer.emit(AudioPlayerStatus.Idle);
        return;
    }

    public async back(): Promise<void> 
    {
        this.isStoped = false;
        this.queue.trackIndex -= 2;
        if(this.audioPlayer.playing)
        {
            this.audioPlayer.discordPlayer.stop();
            return;
        }
        
        this.audioPlayer.discordPlayer.emit(AudioPlayerStatus.Idle);
        return;
    }

    public get queueList(): Track[]
    {
        return this.queue.tracks;
    }

    public jump(index: number): void
    {
        this.isStoped = false;
        //AudioPlayer'da zaten 1 eklediği için 1 eksik veriyoruz.
        this.queue.trackIndex = index - 2;
        //AudioPlayer Idle olayı tetiklenmesi için stop yapıyoruz.
        if(this.audioPlayer.playing)
        {
            this.audioPlayer.discordPlayer.stop();
            return;
        }
        
        this.audioPlayer.discordPlayer.emit(AudioPlayerStatus.Idle);
        return;
    }

    public stop(): void 
    {
        this.isStoped = true;
        this.audioPlayer.discordPlayer.stop();
    }

    public async seek(second: number): Promise<void>
    {
        if(this.queue.hasTrack(this.queue.trackIndex))
        {
            const track = this.queue.tracks[this.queue.trackIndex];

            const source = await play.stream(track.url, { seek: second });

            const resource = createAudioResource(source.stream, {
                inputType: source.type
            });

            this.audioPlayer.discordPlayer.play(resource);
            return;
        }

        throw "No song is currently playing.";
    }

    public removeTrack(index: number): Track | undefined
    {
        return this.queue.removeTrack(index);
    }

    public clear(): void
    {
        return this.queue.clear();
    }
}