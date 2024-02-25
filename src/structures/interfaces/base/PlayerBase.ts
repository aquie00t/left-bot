import { Collection } from "discord.js";
import Player from "../../player/Player";

export default abstract class PlayerBase {
    protected players: Collection<string, Player>;

    protected constructor()
    {
        this.players = new Collection();
    }

    public createPlayer(guildId: string): Player
    {
        if(this.hasPlayer(guildId))
            return this.getPlayer(guildId);
        this.players.set(guildId, new Player());
        return this.getPlayer(guildId);
    }

    public getPlayer(guildId: string): Player 
    {
        if(!this.hasPlayer(guildId))
            throw "Player Undefined!";
        return this.players.get(guildId)!;
    }

    public hasPlayer(guildId: string): boolean
    {
        return this.players.has(guildId);
    }

    public deletePlayer(guildId: string): boolean
    {
        if(this.hasPlayer(guildId))
            return this.players.delete(guildId);
        throw "You cannot delete a player that does not exist.";

    }
}