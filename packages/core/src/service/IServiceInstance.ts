import {InstanceDescriptor} from "~/service/ServiceClassDescriptor";
import {ServiceInstanceDescriptor} from "~/service/ServiceInstanceDescriptor";
import {onRecallClientInstall, onRecallServerInstall} from "~/shared/symbols";
import {AbstractServer} from "~/server/AbstractServer";
import {AbstractClient} from "~/client/AbstractClient";

export interface IServiceInstance {
  /**
   * @internal
   */
  readonly [InstanceDescriptor]: ServiceInstanceDescriptor;

  /**
   * @internal
   */
  [onRecallServerInstall](server: AbstractServer): void;

  /**
   * @internal
   */
  [onRecallClientInstall](client: AbstractClient): void;

  /**
   * @internal
   */
  [key: string]: any;


}
