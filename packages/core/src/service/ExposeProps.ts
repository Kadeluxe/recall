import {ExposedMethods, getExposedProps, TExposedMap} from "@recall/core";

function walkObject(target: any, path: string[], map: TExposedMap) {
  const exposed = getExposedProps(target);
  if (!exposed) return;
  
  for (const [key, desc] of exposed) {
    const prop = Reflect.get(target, key);
    
    if ("handler" in desc) {
      desc.$this = target;
      map.set([...path, key].join("."), desc);
    } else {
      walkObject(prop, [...path, key], map);
    }
  }
}

export function ExposeProps(client: any) {
  const exposedMap: TExposedMap = new Map();
  walkObject(client, [], exposedMap);
  
  Object.defineProperty(client, ExposedMethods, {
    value: exposedMap,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}
