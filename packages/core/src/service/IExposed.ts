export type MethodHook = (args: any[], cancel: Function) => Promise<void> | undefined;

export interface IExposedProp {
  key: string;
}

export interface IExposed extends IExposedProp {
  before: MethodHook[];
  handler: Function;
  $this: Object;
}

export type TExposedMap = Map<string, IExposedProp | IExposed>;
