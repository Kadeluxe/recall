import {AbstractChannelOptions, DefaultAbstractChannelOptions} from "~/channel/options";
import merge from "lodash/merge";
import {DeepRequired} from "ts-essentials";

export type AbstractClientOptions = {
  connection?: {
    reconnect?: {
      initialDelay?: number;
      maxDelay?: number;
    };
  };
} & AbstractChannelOptions;
export type AbstractClientOptionsFull = DeepRequired<AbstractClientOptions>;

export const DefaultAbstractClientOptions: AbstractClientOptionsFull = merge(
  DefaultAbstractChannelOptions,
  {
    connection: {
      reconnect: {
        initialDelay: 100,
        maxDelay: 1000,
      },
    }
  }
);
