export function isConstructorObject(object: Object) {
  return typeof object == "function" && object.prototype.constructor == object;
}

export function isConstructorPrototypeObject(object: Object) {
  return typeof object == "object" && object.constructor?.prototype == object;
}

export function defineHiddenProperty(target: Object, propertyKey: PropertyKey, value: any) {
  Object.defineProperty(target, propertyKey, {
    value,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}
