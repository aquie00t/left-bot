import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for joining the support server.
 */
export default class SupportServerCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the SupportServerCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Setting up slash command data
        this.data = new SlashCommandBuilder()
            .setName("support-server")
            .setDescription('Use Command to Join Support Server!');
    }

    /**
     * Executes the support-server command.
     * @param {ChatInputCommandInteraction} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // Replying with an embed containing a link to the support server
        await interaction.reply({ embeds: [Embeds.linkEmbed("Click and join the server.", this.client.config.SUPPORT_SERVER )] });
    }
}
