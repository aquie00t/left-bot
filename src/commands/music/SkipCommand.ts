import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

export default class SkipCommand extends CommandBase
{
    public readonly data: SlashCommandBuilder;

    public constructor(client: LeftClient, players: PlayerManager)
    {
        super(client, players);

        this.data = new SlashCommandBuilder()
            .setName("skip")
            .setDescription("It moves to the next row and plays a song if there is one.");

        this.voiceChannel = true;
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>
    {
        if(!this.players.hasPlayer(interaction.guildId!)){
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")]});
            return;
        }

        const player = this.players.getPlayer(interaction.guildId!);

        player.skip();

        await interaction.reply({ embeds: [Embeds.defaultEmbed("Skipped.")]});
    }
}