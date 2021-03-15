import {RequestHandler} from "~/dispatcher/RequestHandler";

export type TServiceMethodMiddlewareFunction = (req: RequestHandler<any>, next: TNextFunction) => any;
export type TServiceMethod = (...args: any[]) => Promise<any>;
export type TNextFunction = () => Promise<any>;

export class MethodPipeline {
  protected readonly _callbacks: (TServiceMethodMiddlewareFunction | TServiceMethod)[] = [];

  constructor(
    protected readonly _method: TServiceMethod
  ) {
    this._callbacks.push(_method);
  }

  public unshift(fn: TServiceMethodMiddlewareFunction) {
    this._callbacks.unshift(fn);
  }

  public push(fn: TServiceMethodMiddlewareFunction) {
    this._callbacks.push(fn);
  }

  public async execute(req: RequestHandler<any>, idx: number = 0) {
    const callback = this._callbacks[idx];
    const next = idx + 1 < this._callbacks.length ? () => this.execute(req, idx + 1) : () => Promise.resolve();

    if (this.isServiceMethod(callback)) {
      req.return(await callback.call(req.instance, ...req.message.params));
    } else {
      await callback.call(req.instance, req, next);
    }
  }

  protected isServiceMethod(fn: TServiceMethodMiddlewareFunction | TServiceMethod): fn is TServiceMethod {
    return fn == this._method;
  }
}
