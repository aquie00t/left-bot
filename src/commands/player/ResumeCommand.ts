import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * A command for unpausing the paused player.
 */
export default class ResumeCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the ResumeCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Define slash command data
        this.data = new SlashCommandBuilder()
            .setName("resume")
            .setDescription("Unpauses the paused player.");

        // Define if the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the resume command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Check if there is an active player in the guild
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // If not, reply with an error message and exit the function
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")] });
            return;
        }

        // Get the player for the guild
        const player = this.players.getPlayer(interaction.guildId!, interaction.channel!);

        // Resume the paused player
        player.resume();

        // Reply with a message indicating that the player has been resumed
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Resumed.")] });
    }
}
