import {getServiceClassDescriptor} from "~/service/ServiceClassDescriptor";
import {isConstructorPrototypeObject} from "~/utils/object";
import {TServiceMethodMiddlewareFunction} from "~/service/MethodPipeline";

export function Before(fn: TServiceMethodMiddlewareFunction) {
  return function <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    if (!isConstructorPrototypeObject(target)) {
      throw new Error(`@Before can only be used on instance properties`);
    }

    if (!descriptor) {
      throw new Error(`@Before can only be used for @Expose'd methods`);
    }

    const classDescriptor = getServiceClassDescriptor(target.constructor);
    if (!classDescriptor.methods.has(propertyKey)) {
      throw new Error(`@Before can only be used for @Expose'd methods`);
    }

    classDescriptor.methods.get(propertyKey)!.unshift(fn);
  };
}
