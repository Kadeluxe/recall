import {MethodPipeline} from "~/service/MethodPipeline";

export const InstanceDescriptor = Symbol("ServiceDescriptor");

export interface IServiceClassDescriptor {
  serviceId?: string;
  methods: TExposedMethodsMap,
  dispatcher: Set<string | symbol>,
  defaultChannel: Set<string | symbol>,
}

export type TExposedMethodsMap = Map<string, MethodPipeline>;

const createClassDescriptor: () => IServiceClassDescriptor = () => ({
  methods: new Map(),
  dispatcher: new Set(),
  defaultChannel: new Set(),
});

export function getServiceClassDescriptor<TFunction extends Function>(instance: TFunction) {
  if (!Reflect.hasMetadata(InstanceDescriptor, instance)) {
    Reflect.defineMetadata(InstanceDescriptor, createClassDescriptor(), instance);
  }

  return Reflect.getMetadata(InstanceDescriptor, instance) as IServiceClassDescriptor;
}
