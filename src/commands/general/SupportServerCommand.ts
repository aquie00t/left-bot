import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import LeftClient from "../../structures/LeftClient";
import CommandBase from "../../structures/interfaces/CommandBase";

export default class SupportServerCommand extends CommandBase {

    public readonly data: SlashCommandBuilder;
    public constructor(client: LeftClient) {
        super(client);

        this.data = new SlashCommandBuilder()
            .setName("support-server")
            .setDescription('Support Server Get Link.');

    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({ content: this.client.config!.SUPPORT_SERVER! });
    }
}