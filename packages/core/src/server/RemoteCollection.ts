import {AbstractRemote, InvokeContext, InvokeContextExtensions, Remote, ServerDispatcher} from "@recall/core";

export class RemoteCollection<TRemote> {
  protected dispatcher: ServerDispatcher<TRemote>;
  protected remotes: Set<AbstractRemote>;
  
  constructor(dispatcher: ServerDispatcher<TRemote>, remotes: IterableIterator<AbstractRemote>) {
    this.dispatcher = dispatcher;
    this.remotes = new Set(remotes);
  }
  
  public exclude(remote: InvokeContextExtensions) {
    this.remotes.delete(remote[Remote] as AbstractRemote);
    
    return this;
  }
  
  public broadcast(): TRemote & InvokeContextExtensions {
    return new InvokeContext(this.dispatcher, this.remotes) as any;
  }
}
