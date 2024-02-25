import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

export default class LeaveCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;
    public constructor(client: LeftClient, players: PlayerManager)
    {
        super(client, players);

        this.data = new SlashCommandBuilder()
            .setName("leave")
            .setDescription("separated from the audio channel.");
    }
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        if(!this.players.hasPlayer(interaction.guildId!)){
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")]});
            return;
        }

        const player = this.players.getPlayer(interaction.guildId!);

        if(!player.hasConnect(interaction.guildId!))
        {
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no link yet.")]});
            return;
        }

        player.leave(interaction.guildId!);
 
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Leaved.")]});
    }
}