import {IServiceInstance} from "~/service/IServiceInstance";
import {getServiceClassDescriptor, InstanceDescriptor} from "~/service/ServiceClassDescriptor";
import {ServiceInstanceDescriptor} from "~/service/ServiceInstanceDescriptor";
import {defineHiddenProperty} from "~/utils/object";
import {INotificationMessage, IRequestMessage} from "~/message/message";
import {AbstractChannel} from "~/channel/AbstractChannel";
import {RequestHandler} from "~/dispatcher/RequestHandler";

export class ServiceDispatcher {
  protected readonly _services: Map<string, IServiceInstance> = new Map();

  public constructor() {

  }

  public get services() {
    return [...this._services.values()];
  }

  public expose<T>(instance: IServiceInstance, id?: string) {
    const classDescriptor = getServiceClassDescriptor(instance.constructor);
    id = id ?? classDescriptor.serviceId;
    if (!id) {
      throw new Error(`No id provided for exposed service`);
    }

    if (this._services.has(id)) {
      throw new Error(`Trying to expose a service using already exposed id '${id}'`);
    }

    this._services.set(id, instance);

    if (instance[InstanceDescriptor] === undefined) {
      const instanceDescriptor = new ServiceInstanceDescriptor(classDescriptor, id);
      defineHiddenProperty(instance, InstanceDescriptor, instanceDescriptor);
    }
  }

  public async processRequest(channel: AbstractChannel, message: IRequestMessage | INotificationMessage) {
    const {service, method: methodName} = message;

    if (service === undefined || methodName === undefined) {
      throw new Error(`Incorrect invoke received: ${service}.${methodName}`);
    }

    const instance = this._services.get(service);
    if (!instance) {
      throw new Error(`Undefined service id received: ${service}`);
    }

    const pipeline = instance[InstanceDescriptor].classDescriptor.methods.get(methodName);
    if (!pipeline) {
      throw new Error(`Undefined method name received: ${service}.${methodName}`);
    }

    const handler = new RequestHandler(channel, instance, pipeline, message);
    await handler.execute();
  }
}
