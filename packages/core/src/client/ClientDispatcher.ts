import {AbstractRemote, BaseDispatcher} from "@recall/core";

export abstract class ClientDispatcher extends BaseDispatcher {
  public abstract server: AbstractRemote;
}
