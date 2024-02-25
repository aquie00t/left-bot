import LeftClient from "../../LeftClient";

export default abstract class HandlerBase {
    protected client: LeftClient;
    protected constructor(client: LeftClient) {
        this.client = client;
    }
}