import { CacheType, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

export default class PlayCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    public constructor(client: LeftClient, players: PlayerManager)
    {
        super(client, players);
        this.voiceChannel = true;
        this.data = new SlashCommandBuilder()
            .setName("play")
            .setDescription("The song plays.")
            .addStringOption(option =>
                option
                    .setName("query")
                    .setDescription("Text to query on Youtube or Spotify.")
                    .setRequired(true)) as SlashCommandBuilder;
    }
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const query_string = interaction.options.getString("query")!;
        const player = this.players.createPlayer(interaction.guildId!, {
            textChannel: interaction.channel!
        });

        if(!player.hasConnect(interaction.guildId!))
        {
            const memberVoiceChannel = (interaction.member as GuildMember).voice.channel!;

            player.join({
                channelId: memberVoiceChannel.id,
                guildId: memberVoiceChannel.guildId,
                adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator
            });
        }
        const query_result = await player.search(query_string);

        if(query_result.length == 0) {
            interaction.reply({ embeds: [Embeds.errorEmbed("No results found.")]});
            return;
        } 

        query_result.forEach(track => player.addTrack(track));

        if(player.playing) {
            if(query_result.length > 1) {
                //playlist
                await interaction.reply({ embeds: [Embeds.defaultEmbed(`Added qeueu \` ${query_result.length} \` tracks`)]});
                return;
            }
            await interaction.reply({ embeds: [Embeds.defaultEmbed(`Added queue \` ${query_result[0].title} \``)]});
            return;
        }

        player.playFromQueue();
        
        await interaction.reply({ embeds: [Embeds.nowPlayingEmbed(query_result[0].title)] });
    }
}