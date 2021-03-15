import {bind} from "@decorize/bind";
import {WsRemote, WsRemoteClient} from "@recall/ws";
import http from "http";
import WebSocket, {ServerOptions} from "ws";
import {RemoteCollection, ServerDispatcher} from "@recall/core";
import {mapIterator} from "../utils";

export class WsServerDispatcher<TRemote> extends ServerDispatcher<TRemote> {
  public static HEARTBEAT_INTERVAL = 30_000;
  
  protected server!: WebSocket.Server;
  protected remotes: WeakMap<WebSocket, WsRemoteClient> = new Map();
  
  protected heartbeatInterval: NodeJS.Timer;
  
  constructor(implementation: any) {
    super(implementation);
    
    this.heartbeatInterval = setInterval(this.heartbeat, WsServerDispatcher.HEARTBEAT_INTERVAL);
  }
  
  @bind()
  public heartbeat() {
    for (const client of this.server.clients) {
      const remote = this.remotes.get(client)!;
      
      if (!remote.isAlive) {
        client.terminate();
        continue;
      }
      
      remote.isAlive = false;
      client.ping();
    }
  }
  
  public getRemotes() {
    return new RemoteCollection<TRemote>(this, mapIterator(this.server.clients, client => this.remotes.get(client)!));
  }
  
  public init(options: ServerOptions) {
    this.server = new WebSocket.Server(options);
    
    this.server.on("connection", this.onRemoteConnect);
    this.server.on("close", this.onServerClose);
  }
  
  @bind()
  public onServerClose() {
    clearInterval(this.heartbeatInterval);
  }
  
  @bind()
  public onRemoteConnect(ws: WebSocket, req: http.IncomingMessage) {
    const remote = new WsRemoteClient(ws);
    
    ws.on("message", data => this.receiveData(remote, data as string));
    ws.on("close", (code, reason) => this.onRemoteDisconnect(remote, code, reason));
    ws.on("pong", () => remote.isAlive = true);
    
    this.remotes.set(ws, remote);
  }
  
  public onRemoteDisconnect(remote: WsRemote, code: number, reason: string) {
  
  }
}
