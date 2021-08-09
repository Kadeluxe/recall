import {INotificationMessage, IRequestMessage, IResponseMessage, isIncomingMessage} from "~/message/message";
import {AsyncTask} from "@kadeluxe/async-task";
import {Timeout} from "~/utils/Timeout";
import {LocalError} from "~/errors/LocalError";
import {ServiceDispatcher} from "~/dispatcher/ServiceDispatcher";
import {IRequestSender} from "~/channel/IRequestSender";
import {AbstractChannelOptionsFull} from "~/channel/options";
import {RecallServiceChannelId} from "~/common/const";
import {createInvokeContext} from "~/service/InvokeContext";
import {VoidReturnTypes} from "~/utils/types";
import {RemoteError} from "~/errors/RemoteError";

export enum ChannelState {
  Disconnected,
  Connected,
  Handshaked,

  Ready = ChannelState.Handshaked,
}

interface IPendingRequest {
  task: AsyncTask<IResponseMessage>;
  service: string;
  method: string;
}

const RequestError = Symbol();

const enum RequestErrorType {
  Local,
  Remote,
}

type TRequestError = [typeof RequestError, RequestErrorType, number];

function isRequestError(value: unknown): value is TRequestError {
  return Array.isArray(value) && value[0] == RequestError;
}

export const enum ChannelCloseReason {
  Normal,
  HandshakeError,
  Timeout,
}

export abstract class AbstractChannel<Context = unknown> implements IRequestSender {
  protected readonly _requests = new Map<number, IPendingRequest>();
  protected readonly _queue = new Set<IRequestMessage>();
  protected _lastRequestId = -1;

  protected constructor(
    public readonly ctx: Context,
    protected readonly _dispatcher: ServiceDispatcher,
    protected readonly _options: AbstractChannelOptionsFull
  ) {

  }

  private _state: ChannelState = ChannelState.Disconnected;

  public get state(): ChannelState {
    return this._state;
  }

  public abstract close(reason: ChannelCloseReason): void;

  public call<T>(service: string): T {
    return createInvokeContext(this, service, true);
  }

  public notify<T>(service: string): VoidReturnTypes<T> {
    return createInvokeContext(this, service, false);
  }

  public async request(service: string, method: string, params: any[], isInvoke: boolean) {
    // TODO: rework notifications
    if (!isInvoke) {
      const message: INotificationMessage = {
        service,
        method,
        params,
      };

      this.sendMessage(message);
      return;
    }

    const message: IRequestMessage = {
      id: this.getNextId(),
      service,
      method,
      params,
    };

    const task = new AsyncTask<IResponseMessage>();
    const timeout = Timeout.for(() => {
      task.reject([RequestError, RequestErrorType.Local, LocalError.Timeout] as TRequestError);
    }, this._options.connection.timeout);

    const shouldSend = this.state == ChannelState.Ready || this.state == ChannelState.Connected && service == RecallServiceChannelId;

    task
      .catch(() => undefined)
      .finally(() => {
        timeout.cancel();
        this._requests.delete(message.id);
        if (!shouldSend) this._queue.delete(message);
      });

    this._requests.set(message.id, {task, service, method});

    if (shouldSend) {
      this.sendMessage(message);
    } else {
      this._queue.add(message);
    }

    try {
      return await task;
    } catch (e: unknown) {
      if (isRequestError(e)) {
        const [, type, code] = e;
        if (type == RequestErrorType.Local) {
          throw new LocalError(code, service, method);
        } else if (type == RequestErrorType.Remote) {
          throw new RemoteError(code, service, method);
        }
      }

      throw e;
    }
  }

  public abstract sendMessage(message: INotificationMessage | IRequestMessage | IResponseMessage): void | Promise<void>;

  protected setChannelState(state: ChannelState) {
    this._state = state;

    if (state == ChannelState.Connected) {
      this._lastRequestId = 0;
    } else if (state == ChannelState.Handshaked) {
      for (const it of this._queue) {
        this.sendMessage(it);
      }

      this._queue.clear();
    } else if (state == ChannelState.Disconnected) {
      for (const [, {task}] of this._requests) {
        task.reject([RequestError, RequestErrorType.Local, LocalError.Reset] as TRequestError);
      }

      this._requests.clear();
    }
  }

  protected onResponseMessage(message: IResponseMessage) {
    const request = this._requests.get(message.id);
    if (!request) {
      return;
    }

    if (message.error) {
      request.task.reject([RequestError, RequestErrorType.Remote, message.error.code] as TRequestError);
    } else {
      request.task.resolve(message.result);
    }
  }

  protected async onIncomingMessage(message: INotificationMessage | IRequestMessage | IResponseMessage) {
    if (isIncomingMessage(message)) {
      await this._dispatcher.processRequest(this, message);
    } else {
      this.onResponseMessage(message);
    }
  }

  protected getNextId() {
    return ++this._lastRequestId;
  }
}
