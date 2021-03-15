type MapFn<TValue, TMapped> = (value: TValue) => TMapped;

// TODO: is return typing correct?
export function* mapIterator<TValue, TMapped>(iterator: Iterable<TValue>, callback: MapFn<TValue, TMapped>) {
  for (const x of iterator) {
    yield callback(x);
  }
}
