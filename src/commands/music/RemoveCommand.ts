import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * A command for deleting a track from the queue.
 */
export default class RemoveCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the RemoveCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Define slash command data
        this.data = new SlashCommandBuilder()
            .setName("remove")
            .setDescription("Deletes a track from the queue.")
            .addNumberOption(option => option.setName("index").setDescription("Index number of the track to be deleted").setRequired(true)) as SlashCommandBuilder;
        
        // Define if the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the remove command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Check if there is an active player in the guild
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // If not, reply with an error message and exit the function
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")] });
            return;
        }

        // Get the index of the track to be removed from the command options
        const index = interaction.options.getNumber("index")!;

        // Get the player for the guild
        const player = this.players.getPlayer(interaction.guildId!);

        // Remove the track from the queue
        const removedTrack = player.removeTrack(index);

        // Check if the track was successfully removed
        if (removedTrack) {
            // If removed, reply with a success message
            await interaction.reply({ embeds: [Embeds.defaultEmbed(`\` ${removedTrack.title} \` Removed.`)] });
            return;
        }

        // If the track was not found, reply with an error message
        await interaction.reply({ embeds: [Embeds.errorEmbed("There is no such track anyway")] });
    }
}
