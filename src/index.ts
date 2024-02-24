import { config } from "dotenv";
import { LeftClient } from "./structures/LeftClient";

(async() => {
    config();

    const client = new LeftClient();

    if(!process.env.DISCORD_TOKEN) {
        console.error('Check the .env file DISCORD_TOKEN is missing.');
        process.exit(0);
    }

    await client.initialize(process.env.DISCORD_TOKEN);
})();