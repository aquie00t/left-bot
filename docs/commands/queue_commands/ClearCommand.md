# Clear Command Documentation

## Overview

The "Clear" command allows users to clean the queue of tracks.

## Command Syntax

```bash
/clear
```

## Description

This command enables users to remove all tracks from the queue.

## Usage

1. Type `/clear` in any text channel where the bot is present.
2. The bot will remove all tracks from the queue.

## Examples

### Command:
```bash
/clear
```
### Result:

- The bot will remove all tracks from the queue.

## Code Implementation

```typescript
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * A command for cleaning the queue.
 */
export default class ClearCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the ClearCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Define slash command data
        this.data = new SlashCommandBuilder()
            .setName("clear")
            .setDescription("Cleans the queue.");

        // Define if the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the clear command.
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

        // Clear the queue
        player.clear();

        // Reply with a message indicating that the queue has been cleared
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Cleared.")] });
    }
}
