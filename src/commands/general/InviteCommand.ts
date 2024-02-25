import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import LeftClient from "../../structures/LeftClient";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import Embeds from "../../structures/utils/Embeds";

export default class SupportServerCommand extends CommandBase {

    public readonly data: SlashCommandBuilder;
    public constructor(client: LeftClient) {
        super(client);

        this.data = new SlashCommandBuilder()
            .setName("invite")
            .setDescription('Add Me to Your Server');

    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({ embeds: [Embeds.linkEmbed("Click to Add Me to Your Server", this.client.config.INVITE_URL )] });
    }
}