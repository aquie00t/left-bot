import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { Track } from "../../types/query";
import play from 'play-dl';
import QueueManager from "./QueueManager";
import IPlayerOptions from "../interfaces/IPlayerOptions";
import Embeds from "../utils/Embeds";
import { Message } from "discord.js";
import ConnectionManager from "./ConnectionManager";
import Player from "../Player";
import { QueueRepeatMode } from "../interfaces/enums/QueueRepeatMode";

/**
 * Class for managing the audio player.
 */
export default class AudioPlayerManager {
    public discordPlayer!: AudioPlayer;
    private readonly queueManager: QueueManager;
    private readonly options: IPlayerOptions;
    private deletedMessage?: Message;
    private connection: ConnectionManager;
    private idleTimeOut?: NodeJS.Timeout;
    private readonly player: Player;

    /**
     * Constructor for AudioPlayerManager.
     * @param {QueueManager} queueManager - The queue manager.
     * @param {IPlayerOptions} options - The player options.
     * @param {ConnectionManager} connection - The connection manager.
     * @param {Player} player - The player.
     */
    public constructor(queueManager: QueueManager, options: IPlayerOptions, connection: ConnectionManager, player: Player) {
        this.connection = connection;
        this.queueManager = queueManager;
        this.options = options;
        this.player = player;
    }

    /**
     * Creates a Discord audio player.
     * @returns {AudioPlayer} - The created audio player.
     */
    public createDiscordAudioPlayer(): AudioPlayer {
        this.discordPlayer = createAudioPlayer();
        this.initializeEvents();
        return this.discordPlayer;
    }

    /**
     * Plays a track.
     * @param {Track} track - The track to play.
     * @returns {Promise<void>} - Resolves when playback starts.
     */
    public async play(track: Track): Promise<void> {
        if (track.source == "spotify") {
            if (!track.sp_data)
                throw new Error("Spotify Data Undefined.");

            if (!track.stream_url) {
                //spotify stream create.
                const searched = await play.search(track.sp_data);
                if (searched.length == 0)
                    throw "No YouTube data compatible with Spotify data was found..";
                track.stream_url = searched[0].url;
            }
        }

        const stream = await play.stream(track.stream_url!);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        this.discordPlayer.play(resource);
    }

    /**
     * Initializes event listeners for the audio player.
     */
    private initializeEvents(): void {
        this.discordPlayer.on(AudioPlayerStatus.Idle, this.onIdle.bind(this));
        this.discordPlayer.on(AudioPlayerStatus.Playing, this.onPlaying.bind(this));
    }

    /**
     * Checks if the audio player is playing.
     * @returns {boolean} - True if the player is playing, false otherwise.
     */
    public get playing(): boolean {
        return this.discordPlayer.state.status == AudioPlayerStatus.Playing;
    }

    /**
     * Creates a timeout for idle state.
     */
    public createIdleTimeOut(): void {
        this.idleTimeOut = setTimeout(async () => {
            if (this.connection.connection) {
                const inDisconnect = this.connection.connection.disconnect();
                if (inDisconnect)
                    await this.options.textChannel.send({ embeds: [Embeds.defaultEmbed("I  left the audio channel because I was inactive for a long time.")] });
            }
        }, 50000);
    }

    //#region Events
    /**
     * Event handler for when the player is idle.
     */
    private async onIdle(): Promise<void> {
        if (this.deletedMessage)
            if (this.deletedMessage.deletable)
                await this.deletedMessage.delete().catch(e => console.error(e));

        if (!this.player.isStopped) {
            if (this.player.repeatMode == QueueRepeatMode.Default)
                this.queueManager.trackIndex += 1;
            else if (this.player.repeatMode == QueueRepeatMode.QueueLoop) {
                if (this.queueManager.hasTrack(this.queueManager.trackIndex + 1))
                    this.queueManager.trackIndex += 1;
                else
                    this.queueManager.trackIndex = 0;
            }

            if (this.queueManager.hasTrack(this.queueManager.trackIndex)) {
                const track = this.queueManager.tracks[this.queueManager.trackIndex];
                this.play(track);

                this.deletedMessage = await this.options.textChannel.send({ embeds: [Embeds.nowPlayingEmbed(track.title)] });
            }
        }

        if (!this.idleTimeOut)
            this.createIdleTimeOut();
    }

    /**
     * Event handler for when the player starts playing.
     */
    private onPlaying(): void {
        this.player.isStopped = false;
        if (this.connection.timeout)
            clearTimeout(this.connection.timeout);
        if (this.idleTimeOut)
            clearTimeout(this.idleTimeOut);
    }
    //#endregion
}
