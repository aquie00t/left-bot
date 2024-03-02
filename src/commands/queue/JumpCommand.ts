import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for jumping to a specific index in the queue.
 */
export default class JumpCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the JumpCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Defining the slash command data
        this.data = new SlashCommandBuilder()
            .setName("jump")
            .setDescription("It goes to an index you provide in the queue.")
            .addNumberOption(index => 
                index
                    .setName("index")
                    .setDescription("Index number where you want to sit in the queue")
                    .setRequired(true)
            ) as SlashCommandBuilder;

        // Setting voiceChannel flag to true to indicate that the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the jump command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Checking if there is an active player in the guild
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // Replying with an error message if there is no active player
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")] });
            return;
        }

        // Retrieving the player for the guild
        const player = this.players.getPlayer(interaction.guildId!);

        // Getting the index provided in the command options
        const index = interaction.options.getNumber("index")!;

        // Jumping to the specified index in the queue
        player.jump(index);

        // Replying with a message indicating that the jump was successful
        await interaction.reply({ embeds: [Embeds.defaultEmbed(`Jumped to \` ${index} \``)]});
    }
}
