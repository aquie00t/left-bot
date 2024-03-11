declare namespace NodeJS {
    interface ProcessEnv {
        DISCORD_TOKEN: string,
        DISCORD_GENERATED_URL: string,
        SUPPORT_SERVER: string,
        BOT_ID: string,
        NODE_ENV: "test" | "public",
        TEST_GUILD_ID: string
    }
}