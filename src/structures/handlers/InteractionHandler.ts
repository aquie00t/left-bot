import { CacheType, ChatInputCommandInteraction, Collection, Events, Interaction } from "discord.js";
import LeftClient from "../LeftClient";
import HandlerBase from "../interfaces/HandlerBase";
import fs from 'fs';
import CommandBase from "../interfaces/CommandBase";

export default class InteractionHandler extends HandlerBase {

    private readonly commands: Collection<string, CommandBase>;

    public constructor(client: LeftClient) {
        super(client);

        this.commands = new Collection();
    }

    private async loadedCommands() {
        const folders = fs.readdirSync("./src/commands/");

        for(const folder of folders) {
            const files = fs.readdirSync(`./src/commands/${folder}`);
            for(const file of files) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const command = new (await import(`../../commands/${folder}/${file}`)).default(this.client);
                
                this.commands.set(command.data.name, command); 
                return this.commands;            
            }
        }
    }
    private initializeEvents()
    {
        this.client.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));

    }
    public async registerCommands() {
        const testGuild = await this.client.guilds.cache.get("1210984678711099552");

        if(!testGuild) 
            throw "Test Guild Id Invalid.";

        return await testGuild.commands.set(this.commands.map((c => c.data.toJSON())));
    }
    public async initialize() {
        this.initializeEvents();
        await this.loadedCommands();
    }

    //#region 
    private async onInteractionCreate(interaction: Interaction)
    {
        if(!interaction.isCommand())
            return;

        const command = this.commands.get(interaction.commandName)!;
        
        await command.execute(interaction as ChatInputCommandInteraction<CacheType>);
    }
    //#endregion

}