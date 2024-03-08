import { Client, Events, IntentsBitField } from 'discord.js';
import InteractionHandler from './handlers/InteractionHandler';
import ILeftConfig from './interfaces/ILeftClientConfig';

/**
 * Custom Discord client class.
 */
export default class LeftClient extends Client {
    private readonly interactionHandler: InteractionHandler;
    public readonly config: ILeftConfig;

    /**
     * Constructor for LeftClient.
     */
    public constructor() {
        super({
            intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildVoiceStates],
        });

        // Check if required environment variables are provided
        if (!process.env.SUPPORT_SERVER || !process.env.DISCORD_GENERATED_URL) {
            console.error("Generated URL and support server are missing in the .env configuration file.");
            process.exit(0);
        }

        // Configuration settings
        this.config = {
            SUPPORT_SERVER: process.env.SUPPORT_SERVER,
            INVITE_URL: process.env.DISCORD_GENERATED_URL
        };

        // Initialize interaction handler
        this.interactionHandler = new InteractionHandler(this);
    }

    /**
     * Initializes the client and logs in with the provided token.
     * @param {string} token - The bot token.
     * @returns {Promise<string>} - Resolves with the bot token upon successful login.
     */
    public async initialize(token: string): Promise<string> {
        this.initializeEvents();
        await this.interactionHandler.initialize();
        return await this.login(token);
    }

    /**
     * Initializes client events.
     */
    private initializeEvents(): void {
        this.once(Events.ClientReady, this.onReady.bind(this));
    }

    //#region Events
    /**
     * Event handler for when the client is ready.
     */
    private async onReady(): Promise<void> {
        console.log("Bot Is Ready!");
        await this.interactionHandler.registerCommands();
    }
    //#endregion
}
