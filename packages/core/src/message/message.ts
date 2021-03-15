export interface INotificationMessage {
  service: string;
  method: string;
  params: any[];
}

export interface IRequestMessage extends INotificationMessage {
  id: number;
}

export interface IResponseMessage {
  id: number;
  result?: any;
  error?: IRemoteError;
}

export interface IRemoteError {
  code: number;
  message: string;
  data?: any;
}

export function isIncomingMessage(message: object): message is INotificationMessage | IRequestMessage {
  return "service" in message;
}

export function isRequestMessage(message: INotificationMessage | IRequestMessage): message is IRequestMessage {
  return "id" in message;
}
