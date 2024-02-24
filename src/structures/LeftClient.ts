import { Client, Events } from 'discord.js';

export class LeftClient extends Client
{
    public constructor()
    {
        super(
            {
                intents: 1,
            }
        );
    }

    public async initialize(token: string)
    {
        this.initializeEvents();
        await this.login(token);
    }

    private initializeEvents() {
        this.once(Events.ClientReady, this.onReady.bind(this));
    }

    //#region Events
    private onReady()
    {
        console.log("Bot Is Ready!");
    }

    //#endregion
}