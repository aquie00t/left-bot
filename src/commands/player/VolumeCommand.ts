import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command to set the volume of the music player.
 * @extends CommandBase
 */
export default class VolumeCommand extends CommandBase {
    /** Slash command data for volume command */
    public readonly data: SlashCommandBuilder;

    /**
     * Creates a new VolumeCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager)
    {
        super(client, players);

        // Defining slash command data
        this.data = new SlashCommandBuilder()
            .setName("volume")
            .setDescription("Set the volume of the music player.")
            .addNumberOption(option => option.setName("level").setDescription("Volume level (0 - 100)").setRequired(true)) as SlashCommandBuilder;

        // Required voice channel flag
        this.voiceChannel = true;
    }

    /**
     * Executes the volume command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction received.
     * @returns {Promise<void>}
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>
    {
        // Checking if there is an active player in the server
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // If not, replying with an error message and exiting the function
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no music player in this server.")] });
            return;
        }

        // Getting the volume level from the interaction options
        const level = interaction.options.getNumber("level")!;

        // Checking if the provided volume level is within the valid range
        if (level < 0 || level > 100) {
            // If not, replying with a warning message and exiting the function
            await interaction.reply({ embeds: [Embeds.warnEmbed("Please provide a volume level between 0 and 100.")] });
            return;
        }

        // Getting the player instance for the server
        const player = this.players.getPlayer(interaction.guildId!, interaction.channel!);

        // Setting the volume of the player
        player.setVolume(level);

        // Replying with a success message
        await interaction.reply({ embeds: [Embeds.defaultEmbed(`Volume set to \` ${level} \`.`)] });
    }
}
