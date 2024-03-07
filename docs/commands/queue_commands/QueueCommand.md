# Queue Command Documentation

## Overview

The "Queue" command allows users to display the music queue with pagination.

## Command Syntax

```bash
/queue
```

## Description

This command enables users to view the music queue in the current server. It displays the queue with pagination, allowing users to navigate through multiple pages if the queue is long.

## Usage

1. Type `/queue` in any text channel where the bot is present.
2. The bot will display the current music queue with pagination controls.

## Examples

### Command:

```bash
/queue
```

### Result:

- The bot will display the music queue with pagination controls, allowing users to navigate through the pages.

## Code Implementation

```typescript
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, Colors, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import CommandBase from "../../structures/interfaces/base/CommandBase";
import LeftClient from "../../structures/LeftClient";
import PlayerManager from "../../structures/managers/PlayerManager";
import Embeds from "../../structures/utils/Embeds";

/**
 * Command for displaying the music queue with pagination.
 */
export default class QueueCommand extends CommandBase {
    public readonly data: SlashCommandBuilder;

    /**
     * Initializes the QueueCommand instance.
     * @param {LeftClient} client - The LeftClient instance.
     * @param {PlayerManager} players - The PlayerManager instance.
     */
    public constructor(client: LeftClient, players: PlayerManager) {
        super(client, players);

        // Set slash command data
        this.data = new SlashCommandBuilder()
            .setName("queue")
            .setDescription("Shows the queue");
        
        this.voiceChannel = true; // Define if the command requires a voice channel
    }

    /**
     * Executes the queue command.
     * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
     */
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        // Check if the guild has an active player
        if (!this.players.hasPlayer(interaction.guildId!)) {
            // If not, reply with an error message
            await interaction.reply({ embeds: [Embeds.errorEmbed("There is no player anyway.")]});
            return;
        }

        // Get the player for the guild
        const player = this.players.getPlayer(interaction.guildId!);

        // Get the queue list of tracks
        const queue = player.queueList;
        
        // Function to create pages for pagination
        const createPages = (): string[] => {   
            const pageSize = 10; // Number of tracks per page
            const pages: string[] = [];
            
            for (let i = 0; i < queue.length; i += pageSize) {
                const pageTracks = queue.slice(i, i + pageSize); // Get tracks for the current page
                const startingTrackNumber = i + 1; // Calculate the starting track number for the page
                const pageContent = pageTracks.map((track, index) => `** ▫️ ${startingTrackNumber + index} - \` ${track.title} \`**`).join('\n'); // Generate page content with track numbers
                pages.push(pageContent); // Add page content to the pages array
            }
        
            return pages; // Return array of pages
        };
        
        // Generate pages for pagination
        const pages = createPages();
        
        // Function to get page content by index
        const getPage = (index: number): string => {
            if (index >= 0 && index < pages.length) {
                return pages[index]; // Return page content if index is valid
            }
            return "** ▫️ Empty**"; // Return empty message if index is out of bounds
        };

        // Define pagination buttons
        const firstButton = new ButtonBuilder()
            .setCustomId("first")
            .setLabel("FIRST")
            .setStyle(ButtonStyle.Primary);

        const backButton = new ButtonBuilder()
            .setCustomId("back")
            .setLabel("BACK")
            .setStyle(ButtonStyle.Primary);
        
        const nextButton = new ButtonBuilder()
            .setCustomId("next")
            .setLabel("NEXT")
            .setStyle(ButtonStyle.Primary);
        const lastButton = new ButtonBuilder()
            .setCustomId("last")
            .setLabel("LAST")
            .setStyle(ButtonStyle.Primary);

        // Define action row with pagination buttons
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(firstButton, backButton, nextButton, lastButton);

        
        // Function to create embed with page content
        const embed = (pageContent: string): EmbedBuilder => {
            return new EmbedBuilder()
                .setColor(Colors.White) // Set embed color
                .setDescription(pageContent); // Set embed description with page content
        };

        let currentIndex: number = 0; // Current page index
        const response = await interaction.reply({ embeds: [embed(getPage(currentIndex))],components: [row] }); // Initial response with embed and buttons
        const filter = (i: ButtonInteraction<CacheType>): boolean => i.user.id === interaction.user.id;
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 90_000, filter: filter });

        // Event listener for button clicks
        collector.on("collect", async(i: ButtonInteraction<CacheType>) => {
            // Handle button clicks
            switch(i.customId) {
                case "first":
                    currentIndex = 0; // Go to first page
                    break;
                case "back":
                    currentIndex = currentIndex - 1; // Go to previous page
                    break;
                case "next":
                    currentIndex = currentIndex + 1;// Go to next page
                    break;
                case "last":
                    currentIndex = pages.length - 1; // Go to last page
                    break;
            }

            // Update response with new embed and buttons
            await i.update({ embeds: [embed(getPage(currentIndex))], components: [row]});
        });

        // Event listener for collector end
        collector.on("end", async () => {
            // Disable buttons after collector ends
            row.components.forEach(button => button.setDisabled(true));
        
            // Update response with disabled buttons
            await response.edit({ embeds: [embed(getPage(currentIndex))], components: [row] });
        });
    }
}
