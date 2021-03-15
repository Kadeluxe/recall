import {getServiceClassDescriptor} from "~/service/ServiceClassDescriptor";
import {isConstructorObject} from "~/utils/object";

export function ServiceId(id: string) {
  return function <TFunction extends Function>(target: TFunction) {
    if (!isConstructorObject(target)) {
      throw new Error(`@ServiceId can only be used on classes`);
    }

    getServiceClassDescriptor(target).serviceId = id;
  };
}
