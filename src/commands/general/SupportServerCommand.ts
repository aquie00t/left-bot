import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import LeftClient from "../../structures/LeftClient";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import Embeds from "../../structures/utils/Embeds";
import PlayerManager from "../../structures/managers/PlayerManager";

export default class SupportServerCommand extends CommandBase {

    public readonly data: SlashCommandBuilder;
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        this.data = new SlashCommandBuilder()
            .setName("support-server")
            .setDescription('Use Command to Join Support Server!');

    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({ embeds: [Embeds.linkEmbed("Click and join the server.", this.client.config.SUPPORT_SERVER )] });
    }
}