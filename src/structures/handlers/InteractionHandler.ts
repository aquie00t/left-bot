import { ApplicationCommand, CacheType, ChatInputCommandInteraction, Collection, Events, GuildMember, Interaction } from "discord.js";
import LeftClient from "../LeftClient";
import HandlerBase from "../interfaces/base/HandlerBase";
import fs from 'fs';
import CommandBase from "../interfaces/base/CommandBase";
import PlayerManager from "../managers/PlayerManager";
import Embeds from "../utils/Embeds";

export default class InteractionHandler extends HandlerBase {

    private readonly commands: Collection<string, CommandBase>;
    private readonly players: PlayerManager;
    public constructor(client: LeftClient) {
        super(client);

        this.commands = new Collection();
        this.players = new PlayerManager();
    }

    private async loadedCommands(): Promise<Collection<string, CommandBase>> {
        const folders = fs.readdirSync("./src/commands/");

        for(const folder of folders) {
            const files = fs.readdirSync(`./src/commands/${folder}`);
            for(const file of files) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const command: CommandBase = new (await import(`../../commands/${folder}/${file}`)).default(this.client, this.players);
                this.commands.set(command.data.name, command); 
               
            }
        }
        return this.commands;
    }
    private initializeEvents(): void
    {
        this.client.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));

    }
    public async registerCommands(): Promise<Collection<string, ApplicationCommand>> {
        const testGuild = this.client.guilds.cache.get("1210984678711099552");

        if(!testGuild) 
            throw "Test Guild Id Invalid.";
        const commandsDataJSON = this.commands.map((c) => c.data.toJSON());
        
        return await testGuild.commands.set(commandsDataJSON);
    }

    public async initialize(): Promise<void> {
        this.initializeEvents();
        await this.loadedCommands();
    }

    //#region 
    private async onInteractionCreate(interaction: Interaction): Promise<void>
    {
        if(!interaction.isCommand())
            return;

        const command = this.commands.get(interaction.commandName)!;

        if(command.voiceChannel)
        {
            const memberVoiceChannel = (interaction.member as GuildMember).voice.channel;

            if(!memberVoiceChannel)
            {
                await interaction.reply({ embeds: [Embeds.warnEmbed("Join a voice channel try again.")]});
                return;
            }
            
        }
        await command.execute(interaction as ChatInputCommandInteraction<CacheType>);
    }
    //#endregion

}