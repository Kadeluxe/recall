import {getServiceClassDescriptor} from "~/service/ServiceClassDescriptor";
import {isConstructorPrototypeObject} from "~/utils/object";

export function Dispatcher() {
  return function (target: Object, propertyKey: string | symbol) {
    if (!isConstructorPrototypeObject(target)) {
      throw new Error(`@Dispatcher can only be used on instance properties`);
    }

    getServiceClassDescriptor(target.constructor).dispatcher.add(propertyKey);
  };
}
