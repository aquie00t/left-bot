# Remove Command Documentation

## Overview

The "Remove" command allows users to delete a specific track from the music queue.

## Command Syntax

```
/remove <index>
```

## Description

This command enables users to remove a specific track from the music queue in the current server. Users need to provide the index number of the track they want to remove.

## Usage

1. Type `/remove <index>` in any text channel where the bot is present.
2. Replace `<index>` with the index number of the track you want to remove from the queue.
3. The bot will remove the specified track from the queue and provide a confirmation message.

## Examples

### Command:

```bash
/remove 3
```

### Result:

- If a track is successfully removed from the queue at index 3, the bot will reply with a success message confirming the removal.

### Command:
```bash
/remove 10
```

### Result:

- If there is no track at index 10 in the queue, the bot will reply with an error message indicating that there is no such track.

## Code Implementation

```typescript
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * A command for deleting a track from the queue.
 */
export default class RemoveCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the RemoveCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Define slash command data
        this.data = new SlashCommandBuilder()
            .setName("remove")
            .setDescription("Deletes a track from the queue.")
            .addNumberOption(option => option.setName("index").setDescription("Index number of the track to be deleted").setRequired(true)) as SlashCommandBuilder;
        
        // Define if the command requires a voice channel
        this.voiceChannel = true;
    }

    /**
     * Executes the remove command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Check if there is an active player in the guild
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // If not, reply with an error message and exit the function
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")] });
            return;
        }

        // Get the index of the track to be removed from the command options
        const index = interaction.options.getNumber("index")!;

        // Get the player for the guild
        const player = this.players.getPlayer(interaction.guildId!);

        // Remove the track from the queue
        const removedTrack = player.removeTrack(index);

        // Check if the track was successfully removed
        if (removedTrack) {
            // If removed, reply with a success message
            await interaction.reply({ embeds: [Embeds.defaultEmbed(`\` ${removedTrack.title} \` Removed.`)] });
            return;
        }

        // If the track was not found, reply with an error message
        await interaction.reply({ embeds: [Embeds.errorEmbed("There is no such track anyway")] });
    }
}
