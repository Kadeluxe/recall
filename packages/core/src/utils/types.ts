import {PickKeys} from "ts-essentials";

type ReplaceReturnType<Original extends (...args: any) => any, NewReturnType> = (...a: Parameters<Original>) => NewReturnType;
export type VoidReturnTypes<Interface> = {
  [K in PickKeys<Interface, Function>]: ReplaceReturnType<Interface[K], void>;
};
