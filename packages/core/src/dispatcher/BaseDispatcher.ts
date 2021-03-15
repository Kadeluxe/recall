import {AbstractRemote, AsyncTask, ExposedError, ExposedMethods, IMessageInvoke, IMessageResponse, IServiceImplementation, isInvokeMessage, isResponseMessage, MessageFlags, MessageType, MethodHook, ResponseData, Serializer} from "@recall/core";

export abstract class BaseDispatcher {
  protected readonly implementation: IServiceImplementation;
  protected invokes: Map<number, AsyncTask<any>> = new Map();
  
  public constructor(implementation: any) {
    this.implementation = implementation;
  }
  
  public async receiveData(remote: AbstractRemote, input: string) {
    let data: any;
    try {
      data = Serializer.deserialize(input);
    } catch (e) {
      throw e;
    }
    
    if (!Array.isArray(data)) {
      throw new Error();
    }
    
    if (isResponseMessage(data)) {
      this.receiveResponse(remote, data[1], data[2]);
    } else if (isInvokeMessage(data)) {
      await this.receiveInvoke(remote, data[1], data[2], data[3], data[4]);
    } else {
      console.error(data);
      throw new Error();
    }
  }
  
  public async sendInvoke(remote: AbstractRemote, path: string, args: any[], flags: number) {
    const id = remote.getNextCounter();
    const message: IMessageInvoke = [MessageType.Invoke, id, path, args, flags];
    
    remote.send(Serializer.serialize(message));
    
    if (flags & MessageFlags.Volatile) {
      return;
    }
    
    const task = new AsyncTask();
    this.invokes.set(id, task);
    
    return task;
  }
  
  public async receiveInvoke(remote: AbstractRemote, id: number, path: string, args: any[], flags: number) {
    if (!this.implementation[ExposedMethods].has(path)) {
      throw new Error(`Method ${path} is not exposed`); // TODO: throw internal error
    }
    
    const {handler, before, $this} = this.implementation[ExposedMethods].get(path)!;
    
    await this.executeHooks($this, before, args);
    
    let error: Error | ExposedError | undefined = undefined;
    let result: any | undefined = undefined;
    
    try {
      result = await handler.apply($this, args);
    } catch (e) {
      if (e instanceof ExposedError) {
        error = e;
      } else {
        throw e; // TODO
      }
    }
    
    if (flags & MessageFlags.Volatile) {
      return;
    }
    
    this.sendResponse(remote, id, error, result);
  }
  
  public sendResponse(remote: AbstractRemote, id: number, error?: any, data?: any) {
    const message: IMessageResponse = [MessageType.Response, id, [error, data], 0];
    remote.send(Serializer.serialize(message));
  }
  
  public receiveResponse(remote: AbstractRemote, id: number, data: ResponseData) {
    if (!this.invokes.has(id)) {
      throw new Error(`Received response with id ${id} but there is no invoke with such id`);
    }
    
    const invokeTask = this.invokes.get(id)!;
    
    const [error, result] = data;
    if (error) {
      invokeTask.reject(error);
    } else {
      invokeTask.resolve(result);
    }
  }
  
  protected async executeHooks($this: any, hooks: MethodHook[], args: any[]) {
    let isCancelled = false;
    
    const cancel = function () {
      isCancelled = true;
    };
    
    for (const fn of hooks) {
      const ret = fn(args, cancel);
      if (isCancelled) break;
      
      if (typeof ret?.then == "function") {
        await ret;
      }
    }
  }
}
