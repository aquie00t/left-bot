import { AudioPlayerStatus, CreateVoiceConnectionOptions, JoinVoiceChannelOptions, createAudioResource } from "@discordjs/voice";
import { Track } from "../types/query";
import LeftClient from "./LeftClient";
import IPlayerOptions from "./interfaces/IPlayerOptions";
import { QueueRepeatMode } from "./interfaces/enums/QueueRepeatMode";
import AudioPlayerManager from "./managers/AudioPlayerManager";
import ConnectionManager from "./managers/ConnectionManager";
import PlayerManager from "./managers/PlayerManager";
import QueryManager from "./managers/QueryManager";
import QueueManager from "./managers/QueueManager";
import Embeds from "./utils/Embeds";
import play from 'play-dl';
import { VoiceChannel } from "discord.js";
/**
 * The Player class provides functionality for playing music.
 * This class is instantiated with a Discord client, player manager, and options.
 */
export default class Player {
    private readonly players: PlayerManager;
    private readonly connection: ConnectionManager;
    private readonly audioPlayer: AudioPlayerManager;
    private readonly queue: QueueManager;
    public readonly options: IPlayerOptions;
    private readonly client: LeftClient;
    private readonly queryManager: QueryManager;
    public aloneTimeInterval?: NodeJS.Timeout; 
    public isStopped: boolean;
    public repeatMode: QueueRepeatMode;

    /**
     * Constructor of the Player class.
     * @param client - The bot client
     * @param players - The player manager
     * @param options - The player options
     */
    public constructor(client: LeftClient, players: PlayerManager, options: IPlayerOptions) {
        this.players = players;
        this.options = options;
        this.client = client;
        this.queue = new QueueManager;
        this.connection = new ConnectionManager(this.players, this);
        this.audioPlayer = new AudioPlayerManager(this.queue, options, this.connection, this);
        this.queryManager = new QueryManager();
        this.aloneTimeInterval = undefined;
        this.isStopped = false;
        this.repeatMode = QueueRepeatMode.Default;
    }

    /**
     * Joins the specified voice channel.
     * @param config - The voice connection configuration
     */
    public async join(config: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): Promise<void> {
        this.connection.createConnection(config);
        this.audioPlayer.createDiscordAudioPlayer();
        this.connection.subscribe(this.audioPlayer.discordPlayer);

        this.aloneTimeInterval = setInterval(async() => {
            if(this.connection.connection) {
                const botVoiceChannel = this.client.channels.cache.get(this.connection.connection.joinConfig.channelId!) as VoiceChannel;
                if(botVoiceChannel) {
                    if(botVoiceChannel.members.size == 1) {
                        await this.options.textChannel.send({ embeds: [Embeds.defaultEmbed("I left because I was alone in the voice channel.")]});
                        this.connection.connection.disconnect();
                    }
                }
            }
        }, 50000);

        await this.queryManager.setToken();
    }

    /**
     * Checks if there is a connection in the specified guild.
     * @param guildId - The guild ID
     * @returns The connection status
     */
    public hasConnect(guildId: string): boolean {
        return this.connection.hasConnection(guildId);
    }

    /**
     * Closes the connection in the specified guild.
     * @param guildId - The guild ID
     */
    public leave(guildId: string): void {
        if(!this.connection.hasConnection(guildId))
            throw "You can't cut what doesn't exist.";
        this.connection.connection!.disconnect();
    }

    /**
     * Starts playing a given track.
     * @param track - The track to play
     */
    public async play(track: Track): Promise<void> {
        await this.audioPlayer.play(track);
    }

    /**
     * Searches for tracks based on the given query.
     * @param query - The search query
     * @returns The found tracks
     */
    public async search(query: string): Promise<Track[]> {
        const validate = await play.validate(query);

        switch(validate) {
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

    /**
     * Adds a track to the queue.
     * @param track - The track to add
     */
    public addTrack(track: Track): void {
        this.queue.addTrack(track);
    }

    /**
     * Checks if the player is currently playing.
     */
    public get playing(): boolean {
        return this.audioPlayer.playing;
    }

    /**
     * Plays the next track from the queue.
     * @param trackIndex - Index of the track to play, defaults to the current track index in the queue.
     */
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

    /**
     * Skips the current track and moves to the next one in the queue.
     */
    public async skip(): Promise<void>
    {
        this.isStopped = false;
        if(this.audioPlayer.playing)
        {
            this.audioPlayer.discordPlayer.stop();
            return;
        }
        this.audioPlayer.discordPlayer.emit(AudioPlayerStatus.Idle);
        return;
    }

    /**
     * Moves to the previous track in the queue.
     */
    public async back(): Promise<void> 
    {
        this.isStopped = false;
        this.queue.trackIndex -= 2;
        if(this.audioPlayer.playing)
        {
            this.audioPlayer.discordPlayer.stop();
            return;
        }
        
        this.audioPlayer.discordPlayer.emit(AudioPlayerStatus.Idle);
        return;
    }

    /**
     * Gets the list of tracks in the queue.
     * @returns An array of tracks in the queue.
     */
    public get queueList(): Track[]
    {
        return this.queue.tracks;
    }

    /**
     * Jumps to a specific track in the queue.
     * @param index - Index of the track to jump to.
     */
    public jump(index: number): void
    {
        this.isStopped = false;
        this.queue.trackIndex = index - 2;
        if(this.audioPlayer.playing)
        {
            this.audioPlayer.discordPlayer.stop();
            return;
        }
        
        this.audioPlayer.discordPlayer.emit(AudioPlayerStatus.Idle);
        return;
    }

    /**
     * Stops playback.
     */
    public stop(): void 
    {
        this.isStopped = true;
        this.audioPlayer.discordPlayer.stop();
    }

    /**
     * Seeks to a specific position in the currently playing track.
     * @param second - Position to seek to in seconds.
     */
    public async seek(second: number): Promise<void>
    {
        if(this.queue.hasTrack(this.queue.trackIndex))
        {

            const track = this.queue.tracks[this.queue.trackIndex];
            const source = await play.stream(track.stream_url!, { seek: second });
            
            const resource = createAudioResource(source.stream, {
                inputType: source.type
            });

            this.audioPlayer.discordPlayer.play(resource);
            return;
        }

        throw "No song is currently playing.";
    }

    /**
     * Removes a track from the queue.
     * @param index - Index of the track to remove.
     * @returns The removed track, if any.
     */
    public removeTrack(index: number): Track | undefined
    {
        return this.queue.removeTrack(index);
    }

    /**
     * Clears the queue.
     */
    public clear(): void
    {
        return this.queue.clear();
    }

    /**
     * Pauses playback.
     * @returns True if playback was successfully paused, false otherwise.
     */
    public pause(): boolean {
        return this.audioPlayer.discordPlayer.pause();
    }

    /**
     * Resumes playback.
     * @returns True if playback was successfully resumed, false otherwise.
     */
    public resume(): boolean {
        return this.audioPlayer.discordPlayer.unpause();
    }    

    /**
     * Sets the repeat mode for the queue.
     * @param type - The repeat mode to set.
     */
    public setRepeatMode(type: QueueRepeatMode): void
    {
        this.repeatMode = type;
    }

}

