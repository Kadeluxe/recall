import {AbstractAdapter} from "@recall/client/adapters/AbstractAdapter";
import {IRecallException, IRecallResponse} from "@recall/shared/types";

export class FetchAdapter extends AbstractAdapter {
  public async call(url: string, data: any): Promise<IRecallResponse> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (e) {
      throw <IRecallException>{
        isNetworkError: true,
        isRemoteError: false,
        message: e.message,
      };
    }
  }
}