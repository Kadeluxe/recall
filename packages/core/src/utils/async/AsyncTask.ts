export class AsyncTask<T = void> implements Promise<T> {
  [Symbol.toStringTag]: 'Promise';
  
  private promise: Promise<T>;
  private _resolve!: Function;
  private _reject!: Function;
  
  constructor() {
    this.promise = new Promise((resolve, reject) => (this._resolve = resolve, this._reject = reject));
  }
  
  public then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) =>
      TResult1 | PromiseLike<TResult1>) | undefined | null,
    onRejected?: ((reason: any) =>
      TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onFulfilled, onRejected);
  }
  
  public catch<TResult = never>(
    onRejected?: ((reason: any) =>
      TResult | PromiseLike<TResult>) | undefined | null,
  ): Promise<T | TResult> {
    return this.promise.catch(onRejected);
  }
  
  public finally(onFinally?: (() => void) | undefined | null): Promise<T> {
    return this.promise.finally(onFinally);
  }
  
  public resolve(val: T) {
    this._resolve(val);
  }
  
  public reject(reason: any) {
    this._reject(reason);
  }
}
