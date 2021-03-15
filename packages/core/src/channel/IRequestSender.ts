import {VoidReturnTypes} from "~/utils/types";

export interface IRequestSender {
  request(service: string, method: string, params: any[], isInvoke: boolean): Promise<any> | undefined;

  call<T>(service: string): T;

  notify<T>(service: string): VoidReturnTypes<T>;
}
