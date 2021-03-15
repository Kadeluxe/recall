import {WsRemote} from "@recall/ws";
import WebSocket from "ws";

export class WsRemoteServer extends WsRemote {
  constructor(socket: WebSocket) {
    super(socket);
  }
}
