import { ApplicationCommand, CacheType, ChatInputCommandInteraction, Collection, Events, GuildMember, GuildResolvable, Interaction } from "discord.js";
import LeftClient from "../LeftClient";
import HandlerBase from "../interfaces/base/HandlerBase";
import fs from 'fs';
import CommandBase from "../interfaces/base/CommandBase";
import PlayerManager from "../managers/PlayerManager";
import Embeds from "../utils/Embeds";

/**
 * InteractionHandler class handles incoming interactions such as commands.
 */
export default class InteractionHandler extends HandlerBase {

    private readonly commands: Collection<string, CommandBase>;
    private readonly players: PlayerManager;

    /**
     * Constructor for InteractionHandler class.
     * @param client - The Discord client instance
     */
    public constructor(client: LeftClient) {
        super(client);

        this.commands = new Collection();
        this.players = new PlayerManager(this.client);
    }

    /**
     * Loads commands from the command folders.
     * @returns A collection of loaded commands
     */
    private async loadedCommands(): Promise<Collection<string, CommandBase>> {
        const folders = fs.readdirSync("./src/commands/");

        for(const folder of folders) {
            const files = fs.readdirSync(`./src/commands/${folder}`);
            for(const file of files) {
                const command: CommandBase = new (await import(`../../commands/${folder}/${file}`)).default(this.client, this.players);
                this.commands.set(command.data.name, command); 
            }
        }
        return this.commands;
    }

    /**
     * Initializes event listeners for the client.
     */
    private initializeEvents(): void {
        this.client.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));
    }

    /**
     * Registers commands globally the bot is in.
     */
    public async registerCommands():Promise<Collection<string, ApplicationCommand<{ guild: GuildResolvable; }>> | undefined>{
        const commandDataJSON = this.commands.map((c) => c.data.toJSON());
        return await this.client.application?.commands.set(commandDataJSON);
    }

    /**
     * Initializes the InteractionHandler class.
     */
    public async initialize(): Promise<void> {
        this.initializeEvents();
        await this.loadedCommands();
    }

    /**
     * Handles incoming interactions.
     * @param interaction - The received interaction
     */
    private async onInteractionCreate(interaction: Interaction): Promise<void> {
        if(!interaction.isCommand()) {
            return;
        }

        const command = this.commands.get(interaction.commandName)!;

        if(command.voiceChannel) {
            const memberVoiceChannel = (interaction.member as GuildMember).voice.channel;

            if(!memberVoiceChannel) {
                await interaction.reply({ embeds: [Embeds.warnEmbed("Join a voice channel try again.")]});
                return;
            }

            if(interaction.guild?.members.me?.voice.channel) {
                if(memberVoiceChannel.id != interaction.guild!.members.me.voice.channel.id) {
                    await interaction.reply({ embeds: [Embeds.warnEmbed("You must be on the same channel as the bot.")]});
                    return;
                }
            }
        }
        await command.execute(interaction as ChatInputCommandInteraction<CacheType>);
    }
}
