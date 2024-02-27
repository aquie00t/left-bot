import { Collection, Events, VoiceState } from "discord.js";
import LeftClient from "../LeftClient";
import HandlerBase from "../interfaces/base/HandlerBase";
import Player from "../Player";
import Embeds from "../utils/Embeds";

export default class VoiceStateHandler extends HandlerBase
{
    private timeOuts: Collection<string, NodeJS.Timeout>;
    private readonly player: Player;
    public constructor(client: LeftClient, player: Player)
    {
        super(client);
        this.timeOuts = new Collection();
        this.player = player;
    }

    public initialize(): void
    {
        this.initializeEvents();
    }   

    private initializeEvents(): void
    {
        this.client.on(Events.VoiceStateUpdate, this.onVoiceStateUpdate.bind(this));
    }

    //#region Events
    private onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): void
    {
        if(oldState.channel)
        {
            if(oldState.channel.members.size == 1 && oldState.channel.members.first()?.id == "1211016798175236236")
            {
                this.timeOuts.set(oldState.channel.guildId, setTimeout(async () => {
                    await this.player.options.textChannel.send({ embeds: [Embeds.defaultEmbed("I left because I was alone in the voice channel.")]});
                    this.player.leave(oldState.channel!.guildId);
                }, 10000));
            }
        }
        if(newState.channel)
        {
            if(newState.channel.members.has("1211016798175236236"))
            {
                const guildTimeOut = this.timeOuts.get(newState.guild.id);
                clearTimeout(guildTimeOut);
                this.timeOuts.delete(newState.guild.id);
                console.log(this.timeOuts);
            }
        }
    }
    //#endregion 
}