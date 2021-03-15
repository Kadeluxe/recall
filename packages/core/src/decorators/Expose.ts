import {ExposedProps, IExposed, IExposedProp, TClass} from "@recall/core";

export function getExposedProps($class: TClass) {
  // TODO this check is not correct
  if (typeof $class != "object") throw new Error(`Only services and methods can be @Expose'd`);
  
  if (!Reflect.hasMetadata(ExposedProps, $class)) {
    Reflect.defineMetadata(ExposedProps, new Map(), $class);
  }
  
  return Reflect.getMetadata(ExposedProps, $class) as Map<string, IExposedProp | IExposed>;
}

export function Expose() {
  return function <T>(target: any, key: string, descriptor?: TypedPropertyDescriptor<T>) {
    const props = getExposedProps(target);
    
    if (descriptor) {
      props.set(key, {
        key,
        handler: target[key],
        before: [],
        $this: undefined,
      });
    } else {
      props.set(key, {
        key,
      });
    }
  };
}
