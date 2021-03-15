import WebSocket from "ws";
import {bind} from "@decorize/bind";
import {ClientDispatcher} from "@recall/core";
import {AsyncTask} from "@recall/core";
import {WsRemote} from "@recall/ws";

interface ErrnoError extends Error {
  address?: string;
  code?: string;
  dest?: string;
  errno?: string | number;
  info?: Object;
  path?: string;
  port?: number;
  syscall?: string;
}

export class WsClientDispatcher extends ClientDispatcher {
  public static TIMEOUT_DELAY = 35_000;
  public static RECONNECT_INITIAL = 250;
  public static RECONNECT_MAX = 5000;
  
  public server!: WsRemote;
  protected connectTask?: AsyncTask = new AsyncTask();
  
  protected url!: string;
  protected socket?: WebSocket;
  
  protected reconnectDelay: number = WsClientDispatcher.RECONNECT_INITIAL;
  
  protected pingTimeout!: NodeJS.Timer;
  
  public init(url: string) {
    this.url = url;
    
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    
    this.socket = new WebSocket(url);
    this.server = new WsRemote(this.socket);
    
    this.socket.on("open", this.onSocketOpen);
    this.socket.on("ping", this.onPing);
    this.socket.on("message", this.onSocketMessage);
    this.socket.on("error", this.onSocketError);
    this.socket.on("close", this.onSocketClose);
    
    return this.connectTask;
  }
  
  @bind()
  public onPing() {
    clearTimeout(this.pingTimeout);
    
    this.pingTimeout = setTimeout(() => {
      this.socket!.terminate();
    }, WsClientDispatcher.TIMEOUT_DELAY);
  }
  
  @bind()
  protected onSocketClose(code: number, reason: string) {
    clearTimeout(this.pingTimeout);
    
    if (code == 1000) return;
    
    for (const task of this.invokes.values()) {
      task.reject(new Error(`Network error`)); // TODO
    }
    
    this.invokes.clear();
    
    this.reconnect();
  }
  
  @bind()
  protected onSocketError(err: ErrnoError) {
    // TODO: 'close' is not being emitted without 'error' event handler ???
  }
  
  protected reconnect() {
    setTimeout(() => this.init(this.url), this.reconnectDelay);
    
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, WsClientDispatcher.RECONNECT_MAX);
    if (this.reconnectDelay == WsClientDispatcher.RECONNECT_MAX) {
      this.reconnectDelay += Math.floor(Math.random() * 3000);
    }
  }
  
  @bind()
  protected onSocketOpen() {
    this.onPing();
    this.reconnectDelay = WsClientDispatcher.RECONNECT_INITIAL;
    
    if (this.connectTask) {
      this.connectTask.resolve();
      this.connectTask = undefined;
    }
  }
  
  @bind()
  protected onSocketMessage(data: WebSocket.Data) {
    this.receiveData(this.server, data as string).then();
  }
}
