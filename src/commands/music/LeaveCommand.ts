import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for leaving a voice channel.
 */
export default class LeaveCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the LeaveCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Setting up slash command data
        this.data = new SlashCommandBuilder()
            .setName("leave")
            .setDescription("Separated from the audio channel.");
    }

    /**
     * Executes the leave command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Checking if there is an active player in the guild
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // Replying with an error message if there is no active player
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")]});
            return;
        }

        // Getting the player instance for the guild
        const player = this.players.getPlayer(interaction.guildId!);

        // Checking if the bot is connected to a voice channel in the guild
        if (!player.hasConnect(interaction.guildId!)) {
            // Replying with an error message if the bot is not connected
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no link yet.")]});
            return;
        }

        // Leaving the voice channel
        player.leave(interaction.guildId!);
 
        // Replying with a confirmation message
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Leaved.")]});
    }
}
