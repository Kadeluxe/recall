import {AbstractRemote} from "@recall/core";

export interface ISender {
  send(remote: AbstractRemote, data: any): any;
}
