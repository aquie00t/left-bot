import { AudioPlayer, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { Track } from "../../types/query";
import play from 'play-dl';

export default class AudioPlayerManager {
    public discordPlayer!: AudioPlayer;

    public createDiscordAudioPlayer(): AudioPlayer
    {
        this.discordPlayer = createAudioPlayer();

        return this.discordPlayer;
    }

    public async play(track: Track): Promise<void>
    {
        const stream = await play.stream(track.url);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        this.discordPlayer.play(resource);
    }
}