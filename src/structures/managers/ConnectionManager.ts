import { AudioPlayer, CreateVoiceConnectionOptions, JoinVoiceChannelOptions, PlayerSubscription, VoiceConnection, VoiceConnectionStatus, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import PlayerManager from "./PlayerManager";
import Player from "../Player";
import Embeds from "../utils/Embeds";

export default class ConnectionManager 
{
    private readonly players: PlayerManager;
    public connection?: VoiceConnection;
    private readonly audioPlayer: Player;
    public timeout?: NodeJS.Timeout;
    public constructor(players: PlayerManager, audioPlayer: Player)
    {
        this.players = players;
        this.audioPlayer = audioPlayer;
    }

    public createConnection(options: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): VoiceConnection
    {
        if(getVoiceConnection(options.guildId))
            throw "There is already a connection in the guild.";
        
        this.connection = joinVoiceChannel(options);

        this.initializeEvents();
        return this.connection;
    }

    public subsribe(audioPlayer: AudioPlayer): PlayerSubscription
    {
        if(!this.connection)
            throw "Connection undefined!";
        return this.connection.subscribe(audioPlayer)!;
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
        this.timeout = setTimeout(() => {
            if(!this.audioPlayer.playing) {
                if(this.connection)
                {
                    this.audioPlayer.options.textChannel.send({ embeds: [Embeds.defaultEmbed("I left the voice channel because the song wasn't playing.")]});
                    this.connection!.disconnect();
                }
            }
        }, 35000);
    }
    private onDisconnected(): void
    {
        console.log("Disconnected");
        this.connection!.destroy();
        this.players.deletePlayer(this.connection!.joinConfig.guildId);
    }
    //#endregion
}