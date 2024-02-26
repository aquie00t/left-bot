import { CreateVoiceConnectionOptions, JoinVoiceChannelOptions } from "@discordjs/voice";
import PlayerManager from "./managers/PlayerManager";
import ConnectionManager from "./managers/ConnectionManager";
import QueryManager from "./managers/QueryManager";
import { Track } from "../types/query";
import AudioPlayerManager from "./managers/AudioPlayerManager";

export default class Player
{
    private readonly players: PlayerManager;
    private readonly connection: ConnectionManager;
    private readonly audioPlayer: AudioPlayerManager;

    public constructor(players: PlayerManager)
    {
        this.players = players;
        this.connection = new ConnectionManager(this.players);
        this.audioPlayer = new AudioPlayerManager();
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
}