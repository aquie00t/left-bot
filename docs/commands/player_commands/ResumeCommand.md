# Resume Command Documentation

## Overview

The "Resume" command allows the bot to resume playback of the paused player in the Discord server.

## Command Syntax

```bash
/resume
```
## Description

This command enables the bot to resume playback of the paused player in the voice channel where it is connected.

## Usage

1. Type `/resume` in any text channel where the bot is present.
2. The bot will resume playback of the paused player in the voice channel.

## Examples

### Command:

```bash
/resume
```

### Result:

- If the bot successfully resumes playback of the paused player, it will reply with a confirmation message.
- If there is no active player in the guild, it will reply with an error message indicating that there is no player active.

## Code Implementation

```typescript
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * A command for unpausing the paused player.
 */
export default class ResumeCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the ResumeCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Define slash command data
        this.data = new SlashCommandBuilder()
            .setName("resume")
            .setDescription("Unpauses the paused player.");

        // Define if the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the resume command.
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

        // Resume the paused player
        player.resume();

        // Reply with a message indicating that the player has been resumed
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Resumed.")] });
    }
}
