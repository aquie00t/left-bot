import { Collection, TextBasedChannel } from "discord.js";
import Player from "../Player";
import IPlayerOptions from "../interfaces/IPlayerOptions";
import LeftClient from "../LeftClient";

/**
 * Class for managing players.
 */
export default class PlayerManager {
    private readonly players: Collection<string, Player>;
    private readonly client: LeftClient;

    /**
     * Constructor for PlayerManager.
     * @param {LeftClient} client - The LeftClient instance.
     */
    constructor(client: LeftClient) {
        this.client = client;
        this.players = new Collection();
    }

    /**
     * Gets the player for the guild.
     * @param {string} guildId - The guild ID.
     * @returns {Player} - The player for the guild.
     * @throws {string} - If there are no players registered to the guild.
     */
    public getPlayer(guildId: string, textChannel?: TextBasedChannel): Player {
        if (!this.hasPlayer(guildId))
            throw new Error("There are no players registered to the guild.");
        const player = this.players.get(guildId)!;
        if(!player.options.textChannel)
        {
            if(!textChannel)
                throw new Error("You must specify a new channel for messages that have been deleted from the channel used when creating the player.");
            player.options.textChannel = textChannel;
        }   
        return player;
    }

    /**
     * Checks if there is a player registered to the guild.
     * @param {string} guildId - The guild ID.
     * @returns {boolean} - True if there is a player, false otherwise.
     */
    public hasPlayer(guildId: string): boolean {
        return this.players.has(guildId);
    }

    /**
     * Creates a new player for the guild.
     * @param {string} guildId - The guild ID.
     * @param {IPlayerOptions} options - The player options.
     * @returns {Player} - The created player.
     */
    public createPlayer(guildId: string, options: IPlayerOptions): Player {
        if (this.hasPlayer(guildId))
            return this.getPlayer(guildId, options.textChannel);
        this.players.set(guildId, new Player(this.client, this, options));
        return this.getPlayer(guildId);
    }

    /**
     * Deletes the player for the guild.
     * @param {string} guildId - The guild ID.
     * @returns {boolean} - True if the player was deleted successfully, false otherwise.
     * @throws {string} - If there is no player to delete.
     */
    public deletePlayer(guildId: string): boolean {
        if (this.hasPlayer(guildId)) {
            return this.players.delete(guildId);
        }
        throw new Error("You cannot delete a player that does not exist.");
    }
}
