import { Colors, EmbedBuilder } from "discord.js";

export default class Embeds {
    public static defaultEmbed(message: string): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(Colors.White)
            .setDescription(`**▫️ ${message} **`);
    }

    public static linkEmbed(title: string, url: string): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(Colors.White)
            .setDescription(`**🏳️ [${title}](${url})**`);
    }

    public static warnEmbed(warn_message: string): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(Colors.White)
            .setDescription(`**❕ ${warn_message}**`);
    }

    public static errorEmbed(error_message: string): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(Colors.White)
            .setDescription(`**❔ ${error_message} **`);
    }

    public static nowPlayingEmbed(title: string): EmbedBuilder
    {
        return new EmbedBuilder()
            .setColor(Colors.White)
            .setDescription(`**▫️ \`${title} \`**`)
            .setTitle("Now Playing");
    }
}