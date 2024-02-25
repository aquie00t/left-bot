import { Client, Events, IntentsBitField } from 'discord.js';
import InteractionHandler from './handlers/InteractionHandler';
import ILeftConfig from './interfaces/ILeftClientConfig';

export default class LeftClient extends Client
{
    private readonly interactionHandler: InteractionHandler;
    public readonly config: ILeftConfig;
    public constructor()
    {
        super(
            {
                intents: [IntentsBitField.Flags.Guilds],
            }
        );

        if(!process.env.SUPPORT_SERVER || !process.env.DISCORD_GENERATED_URL)
        {
            console.error("Generated url and support server are missing in .env configuration file");
            process.exit(0);
        }

        this.config = {
            SUPPORT_SERVER: process.env.SUPPORT_SERVER,
            INVITE_URL: process.env.DISCORD_GENERATED_URL
        };

        this.interactionHandler = new InteractionHandler(this);
    }

    public async initialize(token: string): Promise<string>
    {
        this.initializeEvents();

        await this.interactionHandler.initialize();
        return await this.login(token);
    }

    private initializeEvents(): void {
        this.once(Events.ClientReady, this.onReady.bind(this));
    }

    //#region Events
    private async onReady(): Promise<void>
    {
        console.log("Bot Is Ready!");
        await this.interactionHandler.registerCommands();
    }

    //#endregion
}