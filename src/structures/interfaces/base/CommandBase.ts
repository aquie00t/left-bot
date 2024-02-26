import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import LeftClient from "../../LeftClient";
import PlayerManager from "../../managers/PlayerManager";

export default abstract class CommandBase {
    protected readonly client: LeftClient;
    public readonly data: SlashCommandBuilder = null!;
    protected readonly players: PlayerManager;
    public voiceChannel: boolean;
    protected constructor(client: LeftClient, players: PlayerManager) {
        this.client = client;
        this.players = players;
        this.voiceChannel = false; // default value
    }

    public abstract execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
}