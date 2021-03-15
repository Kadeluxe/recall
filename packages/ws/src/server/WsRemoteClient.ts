import {WsRemote} from "@recall/ws";
import WebSocket from "ws";

export class WsRemoteClient extends WsRemote {
  public isAlive = true;
  
  constructor(socket: WebSocket) {
    super(socket);
  }
}
