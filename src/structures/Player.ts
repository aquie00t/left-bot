import { CreateVoiceConnectionOptions, JoinVoiceChannelOptions } from "@discordjs/voice";
import PlayerManager from "./managers/PlayerManager";
import ConnectionManager from "./managers/ConnectionManager";
import QueryManager from "./managers/QueryManager";
import { Track } from "../types/query";
import AudioPlayerManager from "./managers/AudioPlayerManager";
import QueueManager from "./managers/QueueManager";
import IPlayerOptions from "./interfaces/IPlayerOptions";
import VoiceStateHandler from "./handlers/VoiceStateHandler";
import LeftClient from "./LeftClient";

export default class Player
{
    private readonly players: PlayerManager;
    private readonly connection: ConnectionManager;
    private readonly audioPlayer: AudioPlayerManager;
    private readonly queue: QueueManager;
    public readonly options: IPlayerOptions;
    private readonly voiceStateHandler: VoiceStateHandler;
    private readonly client: LeftClient;
    public constructor(client: LeftClient, players: PlayerManager, options: IPlayerOptions)
    {
        this.players = players;
        this.options = options;
        this.client = client;
        this.queue = new QueueManager;
        this.connection = new ConnectionManager(this.players, this);
        this.audioPlayer = new AudioPlayerManager(this.queue, options, this.connection);
        this.voiceStateHandler = new VoiceStateHandler(this.client, this);

        this.voiceStateHandler.initialize();
    }

    public join(config: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): void
    {
        this.connection.createConnection(config);
        this.audioPlayer.createDiscordAudioPlayer();
        this.connection.subsribe(this.audioPlayer.discordPlayer);
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
        return (await QueryManager.youtubeQuery(query));
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
        const track = this.queue.tracks[trackIndex];

        if(!track)
            throw "Track Undefined!";

        return await this.play(track);
    }
}