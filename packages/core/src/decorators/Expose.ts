import {getServiceClassDescriptor} from "~/service/ServiceClassDescriptor";
import {isConstructorPrototypeObject} from "~/utils/object";
import {MethodPipeline} from "~/service/MethodPipeline";

export function Expose() {
  return function <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    if (!isConstructorPrototypeObject(target)) {
      throw new Error(`@Expose can only be used on instance methods`);
    }

    if (!descriptor) {
      throw new Error(`@Expose can only be used for methods`);
    }

    const classDescriptor = getServiceClassDescriptor(target.constructor);
    classDescriptor.methods.set(propertyKey, new MethodPipeline((target as any)[propertyKey]));
  };
}
