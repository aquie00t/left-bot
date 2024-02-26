import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

export default class PlayCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    public constructor(client: LeftClient, players: PlayerManager)
    {
        super(client, players);

        this.data = new SlashCommandBuilder()
            .setName("play")
            .setDescription("Play a music")
            .addStringOption(option =>
                option
                    .setName("query")
                    .setDescription("query string")
                    .setRequired(true)) as SlashCommandBuilder;
    }
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const query_string = interaction.options.getString("query")!;
        const player = this.players.createPlayer(interaction.guildId!);

        //join
        const query_result = await player.search(query_string);

        if(query_result.length == 0) {
            interaction.reply({ embeds: [Embeds.errorEmbed("Query Result Failed!")]});
            return;
        }

        player.play(query_result[0]);
        
        await interaction.reply({ content: query_result[0].title });
    }
}