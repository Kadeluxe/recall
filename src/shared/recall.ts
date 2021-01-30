import {IRecallResponse} from "@recall/shared/types";
import {TEndpointTable, TLocalEndpoint} from "@recall/shared/endpoints";

export class Recall<TContext> {
  public constructor(
    protected endpoints: TEndpointTable,
  ) {

  }

  public async callLocalEndpoint(path: string, args: any[], context: TContext) {
    const endpoint = this.getEndpoint(path);
    if (!endpoint) {
      throw new Error("Endpoint not found"); // TODO
    }

    let result: IRecallResponse;

    try {
      endpoint.before?.forEach(hook => hook.call(context, args));

      const returnData = await endpoint.handler.apply(context, args);
      result = {
        returnData,
      };
    } catch (exception) {
      result = {
        exception,
      };
    }

    return result;
  }

  public getEndpoint(path: string) {
    if (path.length == 0) return undefined;

    const parts = path.split(".");

    let current: TEndpointTable | TLocalEndpoint = this.endpoints;
    for (const it of parts) {
      current = (<TEndpointTable>current)[it];
    }

    if (current != undefined && "handler" in current) {
      return <TLocalEndpoint>current;
    }

    return undefined;
  }
}