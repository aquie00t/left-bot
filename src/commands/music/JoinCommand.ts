import { CacheType, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

export default class JoinCommand extends CommandBase
{
    public readonly data: SlashCommandBuilder;
    public constructor(client: LeftClient,players: PlayerManager)
    {
        super(client, players);
        this.voiceChannel = true;
        this.data = new SlashCommandBuilder()
            .setName("join")
            .setDescription("Join a voice channel");
    }
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const player = this.players.createPlayer(interaction.guildId!);

        const memberVoiceChannel = (interaction.member as GuildMember).voice.channel!;
        
        if(player.hasConnect(memberVoiceChannel.guildId))
        {
            await interaction.reply({ embeds: [Embeds.warnEmbed("There is already a connection in the guild.")]});
            return;
        }
        player.join({
            channelId: memberVoiceChannel.id,
            guildId: memberVoiceChannel.guildId,
            adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator
        });

        await interaction.reply({ embeds: [Embeds.defaultEmbed("Joined a voice channel.")]});
    }

}