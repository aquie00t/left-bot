import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";
import type { repeat_modes } from "../../types/queue";

/**
 * Command for setting the repeat mode.
 */
export default class LoopCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the LoopCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Define slash command data
        this.data = new SlashCommandBuilder()
            .setName("loop")
            .setDescription("Set the repeat mode.")
            .addSubcommand(option => option.setName("track").setDescription("Loop the currently playing track."))
            .addSubcommand(option => option.setName("default").setDescription("Disable repeat mode."))
            .addSubcommand(option => option.setName("queue").setDescription("Loop the entire queue.")) as SlashCommandBuilder;

        // Define if the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the loop command.
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
        const player = this.players.getPlayer(interaction.guildId!);

        // Get the sub-command used by the user
        const sub_command: repeat_modes = interaction.options.getSubcommand(true) as repeat_modes;
        
        // Set the repeat mode based on the sub-command
        switch(sub_command) {
            case "default":
                player.setRepeatMode(0); // Set repeat mode to default (no repeat)
                break;
            case "track":
                player.setRepeatMode(1); // Set repeat mode to track (loop the currently playing track)
                break;
            case "queue":
                player.setRepeatMode(2); // Set repeat mode to queue (loop the entire queue)
                break;
        }

        // Reply with a message indicating that the repeat mode has been set
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Repeat mode set.")] });
    }
}
