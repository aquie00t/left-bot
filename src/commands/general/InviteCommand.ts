import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for inviting the bot to a server.
 */
export default class InviteCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the InviteCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Setting up slash command data
        this.data = new SlashCommandBuilder()
            .setName("invite")
            .setDescription('Add Me to Your Server');
    }

    /**
     * Executes the invite command.
     * @param {ChatInputCommandInteraction} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // Replying with an embed containing an invite link to add the bot to a server
        await interaction.reply({ embeds: [Embeds.linkEmbed("Click to Add Me to Your Server", this.client.config.INVITE_URL )] });
    }
}
