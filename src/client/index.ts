import {AbstractAdapter} from "./adapters/AbstractAdapter";
import {IRecallException} from "@recall/shared/types";

interface IRecallProxy {
  path: string[];
  
  (): void;
}

function getEndpoint(): IRecallProxy;
function getEndpoint(path: string, target: IRecallProxy): IRecallProxy;
function getEndpoint(path?: string, target?: IRecallProxy) {
  const fn = <IRecallProxy>(() => undefined);
  fn.path = [];
  
  if (path !== undefined && target !== undefined) {
    fn.path.push(...target.path, path);
  }
  
  return fn;
}

export function CreateRecallClient(adapter: AbstractAdapter, address: string) {
  const handler: ProxyHandler<any> = {
    get(target: IRecallProxy, p: PropertyKey) {
      return new Proxy(getEndpoint(<string>p, target), handler);
    },
    
    async apply(target: IRecallProxy, thisArg: any, argArray?: any) {
      // TODO config
      const result = await adapter.call(address, [target.path.join("."), argArray]);
      const {returnData, exception} = result;
      
      if (exception) {
        throw <IRecallException>{
          isRemoteError: true,
          isNetworkError: false,
          message: exception.message,
          data: exception.data,
        };
      }
      
      return returnData;
    },
  };
  
  return new Proxy(getEndpoint(), handler);
}