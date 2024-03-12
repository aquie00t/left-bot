import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for fast forwarding the playing track to a certain number of seconds.
 */
export default class SeekCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the SeekCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Defining the slash command data
        this.data = new SlashCommandBuilder()
            .setName("seek")
            .setDescription("Fast forwards the playing track to a certain number of seconds.")
            .addNumberOption(option => option.setName("second").setDescription("The seconds you want to skip to").setRequired(true)) as SlashCommandBuilder;

        // Setting voiceChannel flag to true to indicate that the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the seek command.
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

        // Getting the number of seconds to seek to from the command options
        const second = interaction.options.getNumber("second")!;

        // Seeking to the specified number of seconds
        await player.seek(second)
            .then(async () => {
                // If seeking is successful, replying with a success message
                await interaction.reply({ embeds: [Embeds.defaultEmbed(`The song skipped to the \`${second.toString()}th\` second`)] });
                return;
            }).catch(async () => {
                // If seeking fails, replying with an error message
                await interaction.reply({ embeds: [Embeds.errorEmbed("Please change the seconds.")] });
                return;
            });
    }
}
