import {AbstractChannelOptions, DefaultAbstractChannelOptions} from "~/channel/options";
import {DeepRequired} from "ts-essentials";
import merge from "lodash/merge";

export type AbstractServerOptions = AbstractChannelOptions & {
  connection?: {
    pingInterval?: number;
    pingTimeout?: number;
  },
};
export type AbstractServerOptionsFull = DeepRequired<AbstractServerOptions>;

export const DefaultAbstractServerOptions: AbstractServerOptionsFull = merge(
  {
    connection: {
      pingInterval: 15_000,
      pingTimeout: 5_000,
    },
  },
  {
    ...DefaultAbstractChannelOptions,
  }
);
