import {getServiceClassDescriptor} from "~/service/ServiceClassDescriptor";
import {isConstructorPrototypeObject} from "~/utils/object";

export function DefaultChannel() {
  return function (target: Object, propertyKey: string | symbol) {
    if (!isConstructorPrototypeObject(target)) {
      throw new Error(`@DefaultChannel can only be used on instance properties`);
    }

    getServiceClassDescriptor(target.constructor).defaultChannel.add(propertyKey);
  };
}
