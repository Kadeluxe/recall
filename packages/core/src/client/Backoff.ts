export class Backoff {
  protected _current!: number;
  protected _next!: number;

  protected _scheduleTimer?: NodeJS.Timeout;

  public constructor(
    protected _initialDelay: number,
    protected _maxDelay: number,
  ) {
    this.reset();
  }

  public getNextDelay() {
    const result = Math.min(this._next, this._maxDelay);
    this._next += this._current;
    this._current = result;

    return result;
  }

  public scheduleNext(fn: Function) {
    if (this._scheduleTimer) {
      throw new Error("Backoff is already scheduled");
    }

    this._scheduleTimer = setTimeout(() => {
      this._scheduleTimer = undefined;
      fn();
    }, this.getNextDelay());
  }

  public cancelSchedule() {
    if (this._scheduleTimer) {
      clearTimeout(this._scheduleTimer);
      this._scheduleTimer = undefined;
    }
  }

  public reset() {
    this._current = 0;
    this._next = this._initialDelay;
  }
}
