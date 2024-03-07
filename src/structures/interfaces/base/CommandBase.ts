import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import LeftClient from "../../LeftClient";
import PlayerManager from "../../managers/PlayerManager";

/**
 * Base class for all commands.
 */
export default abstract class CommandBase {
    protected readonly client: LeftClient;
    public readonly data: SlashCommandBuilder = null!;
    protected readonly players: PlayerManager;
    public voiceChannel: boolean;

    /**
     * Constructor for CommandBase class.
     * @param client - The Discord client instance
     * @param players - The player manager instance
     */
    protected constructor(client: LeftClient, players: PlayerManager) {
        this.client = client;
        this.players = players;
        this.voiceChannel = false; // default value
    }

    /**
     * Abstract method to be implemented by sub-classes for executing the command logic.
     * @param interaction - The interaction object received for the command
     */
    public abstract execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
}
