import {DeepRequired} from "ts-essentials";

export type AbstractChannelOptions = {
  connection?: {
    timeout?: number;
  };
}
export type AbstractChannelOptionsFull = DeepRequired<AbstractChannelOptions>;

export const DefaultAbstractChannelOptions: AbstractChannelOptionsFull = {
  connection: {
    timeout: 10_000,
  }
};
