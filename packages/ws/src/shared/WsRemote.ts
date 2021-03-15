import {AbstractRemote} from "@recall/core";
import WebSocket from "ws";

export class WsRemote extends AbstractRemote {
  constructor(
    public readonly socket: WebSocket,
  ) {
    super();
  }
  
  public send(data: any): void {
    this.socket.send(data);
  }
}
