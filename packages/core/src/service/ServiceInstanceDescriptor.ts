import {IServiceClassDescriptor} from "~/service/ServiceClassDescriptor";

export class ServiceInstanceDescriptor {
  public readonly id: string;
  public readonly classDescriptor: IServiceClassDescriptor;

  public constructor(serviceClass: IServiceClassDescriptor, id: string) {
    this.classDescriptor = serviceClass;
    this.id = id;
  }
}
