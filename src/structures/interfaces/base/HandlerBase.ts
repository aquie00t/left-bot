import LeftClient from "../../LeftClient";

/**
 * Base class for all handlers.
 */
export default abstract class HandlerBase {
    protected client: LeftClient;

    /**
     * Constructor for HandlerBase class.
     * @param client - The Discord client instance
     */
    protected constructor(client: LeftClient) {
        this.client = client;
    }
}
