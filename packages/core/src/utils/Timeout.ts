type TCallback = (...args: any[]) => void;

export class Timeout {
  protected _timeout: NodeJS.Timeout;

  public constructor(fn: TCallback, ms: number) {
    this._timeout = setTimeout(fn, ms);
  }

  public static for(fn: TCallback, ms: number) {
    return new Timeout(fn, ms);
  }

  public cancel() {
    clearTimeout(this._timeout);
  }
}
