import { AudioPlayer, CreateVoiceConnectionOptions, JoinVoiceChannelOptions, PlayerSubscription, VoiceConnection, VoiceConnectionStatus, entersState, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import PlayerManager from "./PlayerManager";
import Player from "../Player";
import Embeds from "../utils/Embeds";

/**
 * Class for managing voice connections.
 */
export default class ConnectionManager {
    private readonly players: PlayerManager;
    public connection?: VoiceConnection;
    private readonly audioPlayer: Player;
    public timeout?: NodeJS.Timeout;

    /**
     * Constructor for ConnectionManager.
     * @param {PlayerManager} players - The player manager.
     * @param {Player} audioPlayer - The audio player.
     */
    public constructor(players: PlayerManager, audioPlayer: Player) {
        this.players = players;
        this.audioPlayer = audioPlayer;
    }

    /**
     * Creates a voice connection.
     * @param {CreateVoiceConnectionOptions & JoinVoiceChannelOptions} options - Options for creating the voice connection.
     * @returns {VoiceConnection} - The created voice connection.
     * @throws {string} - If there is already a connection in the guild.
     */
    public createConnection(options: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): VoiceConnection {
        if (getVoiceConnection(options.guildId))
            throw "There is already a connection in the guild.";

        this.connection = joinVoiceChannel(options);

        this.initializeEvents();
        return this.connection!;
    }

    /**
     * Subscribes an audio player to the connection.
     * @param {AudioPlayer} audioPlayer - The audio player to subscribe.
     * @returns {PlayerSubscription} - The player subscription.
     * @throws {string} - If connection is undefined.
     */
    public subscribe(audioPlayer: AudioPlayer): PlayerSubscription {
        if (!this.connection)
            throw "Connection undefined!";
        return this.connection.subscribe(audioPlayer)!;
    }

    /**
     * Checks if a connection exists for the given guild ID.
     * @param {string} guildId - The guild ID.
     * @returns {boolean} - True if connection exists, false otherwise.
     */
    public hasConnection(guildId: string): boolean {
        return getVoiceConnection(guildId) !== undefined;
    }

    /**
     * Initializes event listeners for the connection.
     */
    private initializeEvents(): void {
        if (!this.connection)
            throw new Error("You cannot fire events when there is no connection.");

        this.connection.on(VoiceConnectionStatus.Connecting, this.onConnecting.bind(this));
        this.connection.on(VoiceConnectionStatus.Disconnected, this.onDisconnected.bind(this));
        
    }

    //#region Events
    /**
     * Event handler for when the connection is connecting.
     */
    private onConnecting(): void {
        console.log("Connected.");
        this.timeout = setTimeout(() => {
            if (!this.audioPlayer.playing) {
                if (this.connection) {
                    this.audioPlayer.options.textChannel?.send({ embeds: [Embeds.defaultEmbed("I left the voice channel because the song wasn't playing.")] });
                    this.connection!.disconnect();
                }
            }
        }, 35000);
    }

    /**
     * Event handler for when the connection is disconnected.
     */
    private async onDisconnected(): Promise<void> {
        try {
            await Promise.race([
                entersState(this.connection!, VoiceConnectionStatus.Signalling, 5_000),
                entersState(this.connection!, VoiceConnectionStatus.Connecting, 5_000)
            ]);
        } catch {
            this.connection!.destroy();
            this.players.deletePlayer(this.connection!.joinConfig.guildId);
            clearTimeout(this.audioPlayer.aloneTimeInterval);
        }
    }
    //#endregion
}
