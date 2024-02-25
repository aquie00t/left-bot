import { CreateVoiceConnectionOptions, JoinVoiceChannelOptions, VoiceConnection, VoiceConnectionStatus, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import PlayerManager from "./PlayerManager";

export default class ConnectionManager 
{
    private readonly players: PlayerManager;
    public connection?: VoiceConnection;
    public constructor(players: PlayerManager)
    {
        this.players = players;
    }

    public createConnection(options: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): VoiceConnection
    {
        if(getVoiceConnection(options.guildId))
            throw "There is already a connection in the guild.";
        
        this.connection = joinVoiceChannel(options);

        this.initializeEvents();
        return this.connection;
    }

    public hasConnection(guildId: string): boolean
    {
        return getVoiceConnection(guildId) !== undefined;
    }
    private initializeEvents(): void
    {
        if(!this.connection)
            throw "You cannot fire events when there is no connection.";

        this.connection.on(VoiceConnectionStatus.Connecting, this.onConnecting.bind(this));
        this.connection.on(VoiceConnectionStatus.Disconnected, this.onDisconnected.bind(this));
    }

    //#region Events
    private onConnecting(): void
    {
        console.log("Connected.");
    }
    private onDisconnected(): void
    {
        console.log("Disconnected");
        this.connection!.destroy();
        this.players.deletePlayer(this.connection!.joinConfig.guildId);
        
    }
    //#endregion
}