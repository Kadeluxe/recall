import {AbstractRemote, BaseDispatcher, MessageFlags} from "@recall/core";

const Dispatcher = Symbol("Dispatcher");
export const Remote = Symbol("Remote");
const Path = Symbol("Path");
const Flags = Symbol("Flags");
const $proxy = Symbol("Proxy");

export interface InvokeContextExtensions {
  [Remote]: AbstractRemote | Set<AbstractRemote>;
  
  volatile(): this;
}

export class InvokeContext extends Function {
  public readonly [Remote]: AbstractRemote | Set<AbstractRemote>;
  protected readonly [$proxy]: this;
  protected readonly [Dispatcher]: BaseDispatcher;
  protected readonly [Path]: string[] = [];
  protected [Flags]: number = 0;
  
  constructor(dispatcher: BaseDispatcher, remote: AbstractRemote | Set<AbstractRemote>) {
    super();
    
    this[Dispatcher] = dispatcher;
    this[Remote] = remote;
    
    this[$proxy] = new Proxy(this, {
      apply(target: InvokeContext, thisArg, args) {
        const remote = target[Remote];
        const path = target[Path].join(".");
        
        if (remote instanceof Set) {
          const results = [];
          
          for (const it of remote) {
            results.push(target[Dispatcher].sendInvoke(it, path, args, target[Flags]));
          }
          
          return results;
        } else {
          return target[Dispatcher].sendInvoke(remote, path, args, target[Flags]);
        }
      },
      get(target: InvokeContext, prop: any) {
        if (prop in target) {
          return target[prop as keyof InvokeContext];
        }
        
        target[Path].push(prop);
        return target[$proxy];
      },
    }) as this;
    
    this.volatile = this.volatile.bind(this);
    
    return this[$proxy];
  }
  
  public volatile() {
    this[Flags] |= MessageFlags.Volatile;
    
    return this[$proxy];
  }
}
