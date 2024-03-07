# Pause Command Documentation

## Overview

The "Pause" command allows the bot to pause the currently playing track in the Discord server.

## Command Syntax

```bash
/pause
````

## Description

This command enables the bot to pause the currently playing track in the voice channel where it is connected.

## Usage

1. Type `/pause` in any text channel where the bot is present.
2. The bot will pause the currently playing track in the voice channel.

## Examples

### Command:

```bash
/pause
```

### Result:

- If the bot successfully pauses the track, it will reply with a confirmation message.
- If there is no active player in the guild, it will reply with an error message indicating that there is no player active.

## Code Implementation

```typescript
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import LeftClient from "../../structures/LeftClient";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * A command for pausing the currently playing track.
 */
export default class PauseCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the PauseCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Define slash command data
        this.data = new SlashCommandBuilder()
            .setName("pause")
            .setDescription("Pauses the currently playing track.");

        // Define if the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the pause command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Check if there is an active player in the guild
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // If not, reply with an error message and exit the function
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")] });
            return;
        }

        // Get the player for the guild
        const player = this.players.getPlayer(interaction.guildId!);

        // Pause the currently playing track
        player.pause();

        // Reply with a message indicating that the track has been paused
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Paused.")] });
    }
}
