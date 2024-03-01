import { CacheType, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import LeftClient from "../../structures/LeftClient";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import Embeds from "../../structures/utils/Embeds";
import PlayerManager from "../../structures/managers/PlayerManager";

/**
 * Command for joining a voice channel.
 */
export default class JoinCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the JoinCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Setting up slash command data
        this.data = new SlashCommandBuilder()
            .setName("join")
            .setDescription("Join a voice channel");
        
        // Indicating that this command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the join command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Creating a player for the guild
        const player = this.players.createPlayer(interaction.guildId!, {
            textChannel: interaction.channel!
        });

        // Getting the member's voice channel
        const memberVoiceChannel = (interaction.member as GuildMember).voice.channel!;
        
        // Checking if the bot is already connected to a voice channel in the guild
        if (player.hasConnect(memberVoiceChannel.guildId)) {
            // Replying with a warning message if the bot is already connected
            await interaction.reply({ embeds: [Embeds.warnEmbed("There is already a connection in the guild.")]});
            return;
        }

        // Joining the member's voice channel
        await player.join({
            channelId: memberVoiceChannel.id,
            guildId: memberVoiceChannel.guildId,
            adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator
        });

        // Replying with a confirmation message
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Joined a voice channel.")]});
    }

}
