export interface IWebSocketLike {
  addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: IWebSocketLike, ev: WebSocketEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;

  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

  removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | EventListenerOptions): void;

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;

  close(code?: number, reason?: string): void;
}

export interface IWebSocketLikeConstructor {
  new(url: string): IWebSocketLike;
}
