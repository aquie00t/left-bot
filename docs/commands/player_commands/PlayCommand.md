# Play Command Documentation

## Overview

The "Play" command allows the bot to play music in a voice channel in the Discord server.

## Command Syntax

```bash
/play <query>
````

## Description

This command enables the bot to search for a song based on the provided query string and play it in the voice channel where the command is used.

## Usage

1. Type `/play <query>` in any text channel where the bot is present.
2. The bot will search for the song based on the provided query string and play it in the voice channel.

## Examples

### Command:

```bash
/play Bohemian Rhapsody
````

### Result:

- If the bot successfully finds and plays the song, it will reply with a confirmation message and start playing the song.
- If no results are found for the provided query, it will reply with an error message indicating that no results were found.

## Code Implementation

```typescript
import { CacheType, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for playing music.
 */
export default class PlayCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the PlayCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Set voiceChannel flag to true to indicate the command requires a voice channel
        this.voiceChannel = true;

        // Define command data
        this.data = new SlashCommandBuilder()
            .setName("play")
            .setDescription("The song plays.")
            .addStringOption(option =>
                option
                    .setName("query")
                    .setDescription("Text to query on Youtube or Spotify.")
                    .setRequired(true)) as SlashCommandBuilder;
    }

    /**
     * Executes the play command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Get the query string from the command options
        const query_string = interaction.options.getString("query")!;

        // Create or get the player for the guild
        const player = this.players.createPlayer(interaction.guildId!, {
            textChannel: interaction.channel!
        });

        // Check if the player is not already connected to a voice channel
        if (!player.hasConnect(interaction.guildId!)) {
            // If not, join the voice channel of the member who used the command
            const memberVoiceChannel = (interaction.member as GuildMember).voice.channel!;
            await player.join({
                channelId: memberVoiceChannel.id,
                guildId: memberVoiceChannel.guildId,
                adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator
            });
        }

        // Search for tracks based on the query string
        const query_result = await player.search(query_string);

        // If no results are found, reply with an error message
        if (query_result.length == 0) {
            interaction.reply({ embeds: [Embeds.errorEmbed("No results found.")] });
            return;
        }

        // Add the found tracks to the player's queue
        query_result.forEach(track => player.addTrack(track));

        // If the player is already playing
        if (player.playing) {
            if (query_result.length > 1) {
                // If multiple tracks were added, reply with a message indicating the number of tracks added
                await interaction.reply({ embeds: [Embeds.defaultEmbed(`Added queue \` ${query_result.length} \` tracks`)] });
                return;
            }
            // If only one track was added, reply with a message indicating the track added
            await interaction.reply({ embeds: [Embeds.defaultEmbed(`Added queue \` ${query_result[0].title} \``)] });
            return;
        }

        // If the player is not playing, start playing from the queue
        player.playFromQueue();

        // Reply with a message indicating the now playing track
        await interaction.reply({ embeds: [Embeds.nowPlayingEmbed(query_result[0].title)] });
    }
}
