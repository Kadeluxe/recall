import {ExposeProps, TClass} from "@recall/core";

export function serviceClassDecorator($class: TClass): TClass {
  return class extends $class {
    constructor() {
      super();
      
      ExposeProps(this);
    }
  };
}
