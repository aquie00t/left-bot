# Skip Command Documentation

## Overview

The "Skip" command allows users to move to the next track in the music queue and play it if available.

## Command Syntax

```bash
/skip
```

## Description

This command enables users to skip to the next track in the music queue and play it if there is one available. If there is no active player in the guild, the command will reply with an error message.

## Usage

Simply type `/skip` in any text channel where the bot is present. The bot will then move to the next track in the queue and play it if available.

## Examples

### Command:

```bash
/skip
```

### Result:

- If there is an active player in the guild and a next track available in the queue, the bot will skip to that track and reply with a success message indicating that the track has been skipped.

- If there is no active player in the guild, the bot will reply with an error message indicating that there is no player anyway.

## Code Implementation

```typescript
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for moving to the next track in the queue.
 */
export default class SkipCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the SkipCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Defining the slash command data
        this.data = new SlashCommandBuilder()
            .setName("skip")
            .setDescription("Moves to the next line and plays the song if available.");

        // Setting voiceChannel flag to true to indicate that the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the skip command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Checking if there is an active player in the guild
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // If not, replying with an error message and exiting the function
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")] });
            return;
        }

        // Retrieving the player for the guild
        const player = this.players.getPlayer(interaction.guildId!);

        // Moving to the next track in the queue
        player.skip();

        // Replying with a message indicating that the track has been skipped
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Skipped.")] });
    }
}
