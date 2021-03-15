import {getExposedProps, IExposed, MethodHook} from "@recall/core";

export function Before(fn: MethodHook) {
  return function <T>(target: any, key: string, descriptor?: TypedPropertyDescriptor<T>) {
    if (!descriptor) {
      throw new Error(`@Before can only be used for @Expose'd methods`);
    }
    
    const exposed = getExposedProps(target);
    if (!exposed.has(key)) {
      throw new Error(`@Before can only be used for @Expose'd methods`);
    }
    
    (exposed.get(key) as IExposed).before.push(fn);
  };
}
