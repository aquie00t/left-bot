import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for moving to the previous track in the queue.
 */
export default class SkipCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the SkipCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Defining the slash command data
        this.data = new SlashCommandBuilder()
            .setName("skip")
            .setDescription("Moves to the next line and plays the song if available.");

        // Setting voiceChannel flag to true to indicate that the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the skip command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Checking if there is an active player in the guild
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // If not, replying with an error message and exiting the function
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")] });
            return;
        }

        // Retrieving the player for the guild
        const player = this.players.getPlayer(interaction.guildId!, interaction.channel!);

        // Moving to the previous track in the queue
        player.skip();

        // Replying with a message indicating that the track has been skipped
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Skipped.")] });
    }
}
