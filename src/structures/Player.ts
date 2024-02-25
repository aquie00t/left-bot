import { CreateVoiceConnectionOptions, JoinVoiceChannelOptions } from "@discordjs/voice";
import PlayerManager from "./managers/PlayerManager";
import ConnectionManager from "./managers/ConnectionManager";

export default class Player
{
    private readonly players: PlayerManager;
    private connection: ConnectionManager;
    public constructor(players: PlayerManager)
    {
        this.players = players;
        this.connection = new ConnectionManager(this.players);
    }

    public join(config: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): void
    {
        this.connection.createConnection(config);
    }

    public hasConnect(guildId: string): boolean
    {
        return this.connection.hasConnection(guildId);
    }
}