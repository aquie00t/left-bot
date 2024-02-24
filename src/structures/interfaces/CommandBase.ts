import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import LeftClient from "../LeftClient";

export default abstract class CommandBase {
    protected client: LeftClient;
    public readonly data: SlashCommandBuilder = null!;
    protected constructor(client: LeftClient) {
        this.client = client;
    }

    public abstract execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
}