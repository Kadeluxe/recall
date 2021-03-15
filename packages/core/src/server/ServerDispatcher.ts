import {AbstractRemote, BaseDispatcher, InvokeContext, InvokeContextExtensions} from "@recall/core";
import {AsyncLocalStorage} from "async_hooks";

export class ServerDispatcher<TRemote> extends BaseDispatcher {
  protected readonly asyncLocalStore = new AsyncLocalStorage<AbstractRemote>();
  
  public getRemote(): TRemote & InvokeContextExtensions{
    const remote = this.asyncLocalStore.getStore();
    if (!remote) {
      throw new Error(`Exposed method was called outside of Recall Server context`);
    }
    
    return new InvokeContext(this, remote) as any;
  }
  
  public async receiveInvoke(remote: AbstractRemote, id: number, path: string, args: any[], flags: number): Promise<void> {
    this.asyncLocalStore.run(remote, () => {
      super.receiveInvoke(remote, id, path, args, flags);
    });
  }
}
