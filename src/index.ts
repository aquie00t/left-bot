import { config } from "dotenv";
import LeftClient from "./structures/LeftClient";

// Immediately Invoked Function Expression (IIFE) to initialize the bot
(async (): Promise<void> => {
    // Load environment variables from .env file
    config();

    // Create a new instance of LeftClient
    const client = new LeftClient();

    // Check if DISCORD_TOKEN is defined in the .env file
    if (!process.env.DISCORD_TOKEN) {
        console.error('Check the .env file DISCORD_TOKEN is missing.');
        process.exit(0);
    }

    // Initialize the bot with the Discord token
    await client.initialize(process.env.DISCORD_TOKEN);
})();
