export type TEndpointTable = {
  [key: string]: TEndpointTable | TLocalEndpoint,
}
export type TEndpointHook = Function;
export type TEndpointHandler = (...args: any) => Promise<any>;

export type TLocalEndpoint = {
  before?: TEndpointHook[];
  handler: TEndpointHandler;
}

export type TConsumerInterface<T extends TEndpointTable> = {
  [K in keyof T]: T[K] extends TEndpointTable ? TConsumerInterface<T[K]> : (T[K] extends TLocalEndpoint ? T[K]["handler"] : never)
}