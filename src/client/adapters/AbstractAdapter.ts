import {IRecallResponse} from "@recall/shared/types";

export abstract class AbstractAdapter {
  public abstract call(address: string, data: any): Promise<IRecallResponse>;
}