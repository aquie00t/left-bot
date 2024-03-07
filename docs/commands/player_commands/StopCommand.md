# Stop Command Documentation

## Overview

The "Stop" command allows the bot to stop the audio player in the Discord server.

## Command Syntax

```bash
/stop
```

## Description

This command enables the bot to stop the audio player and clear the queue in the voice channel where it is connected.

## Usage

1. Type `/stop` in any text channel where the bot is present.
2. The bot will stop the audio player and clear the queue in the voice channel.

## Examples

### Command:

```bash
/stop
```

### Result:

- If the bot successfully stops the audio player, it will reply with a confirmation message.
- If there is no active player in the guild, it will reply with an error message indicating that there is no player active.

## Code Implementation

```typescript
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for stopping the audio player.
 */
export default class StopCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the StopCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Defining the slash command data
        this.data = new SlashCommandBuilder()
            .setName("stop")
            .setDescription("Stop the player.");
        
        // Setting voiceChannel flag to true to indicate that the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the stop command.
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

        // Stopping the player
        player.stop();

        // Replying with a message indicating that the player has been stopped
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Stopped.")] });
    }
}
