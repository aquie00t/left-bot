import { Collection } from "discord.js";
import Player from "../Player";

export default class PlayerManager 
{
    private readonly players: Collection<string, Player>;

    constructor()
    {
        this.players = new Collection();
    }

    public getPlayer(guildId: string): Player
    {
        if(!this.hasPlayer(guildId))
            throw "There are no players registered to the guild.";
        return this.players.get(guildId)!;
    }

    public hasPlayer(guildId: string): boolean
    {
        return this.players.has(guildId);
    }

    public createPlayer(guildId: string): Player
    {
        if(this.hasPlayer(guildId))
            return this.getPlayer(guildId);
        this.players.set(guildId, new Player(this));
        console.log("Created Player.");
        return this.getPlayer(guildId);
    }

    public deletePlayer(guildId: string): boolean
    {
        if(this.hasPlayer(guildId))
        {
            console.log("Deleted Player.");
            return this.players.delete(guildId);
        }
        throw "You cannot delete a player that does not exist.";
    }
}