import { CreateVoiceConnectionOptions, JoinVoiceChannelOptions } from "@discordjs/voice";
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
    public constructor(client: LeftClient, players: PlayerManager, options: IPlayerOptions)
    {
        this.players = players;
        this.options = options;
        this.client = client;
        this.queue = new QueueManager;
        this.connection = new ConnectionManager(this.players, this);
        this.audioPlayer = new AudioPlayerManager(this.queue, options, this.connection);
        this.queryManager = new QueryManager();
        this.aloneTimeInterval = undefined;
    }

    public join(config: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): void
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
        this.audioPlayer.discordPlayer.stop();
    }

    public async back(): Promise<void> 
    {
        this.queue.trackIndex -= 2;
        this.audioPlayer.discordPlayer.stop();
    }
}