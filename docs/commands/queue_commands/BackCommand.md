# Back Command Documentation

## Overview

The "Back" command allows users to move to the previous track in the queue and play it if available.

## Command Syntax

```bash
/back
```

## Description

This command enables users to move to the previous track in the queue and play it if there is one available.

## Usage

1. Type `/back` in any text channel where the bot is present.
2. The bot will move to the previous track in the queue and play it if available.

## Examples

### Command:

```bash
/back
```

### Result:

- The bot will move to the previous track in the queue and play it if there is one available.

## Code Implementation

```typescript
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for skipping to the previous track in the queue.
 */
export default class BackCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the BackCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Setting up slash command data
        this.data = new SlashCommandBuilder()
            .setName("back")
            .setDescription("It moves to the previous row and plays a song if there is one.");

        // Indicating that this command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the back command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Checking if there is an active player in the guild
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // Replying with an error message if there is no active player
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")] });
            return;
        }

        // Getting the player instance for the guild
        const player = this.players.getPlayer(interaction.guildId!);

        // Moving to the previous track in the queue
        player.back();

        // Replying with a confirmation message
        await interaction.reply({ embeds: [Embeds.defaultEmbed("Backed.")] });
    }
}
