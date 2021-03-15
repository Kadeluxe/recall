import {BaseDispatcher, ExposedMethods, IExposed} from "@recall/core";

export interface IServiceImplementation {
  readonly dispatcher: BaseDispatcher;
  readonly [ExposedMethods]: Map<string, IExposed>
}
