import {ref, Ref} from "@vue/reactivity";

interface IUseRequestReturn<T> {
  loading: Ref<boolean>;
  result: Ref<T>;
  call: (promise: Promise<any>) => Promise<any>;
}

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export function useRequest<T extends (...args: any) => Promise<any>>(): IUseRequestReturn<Awaited<ReturnType<T>>> {
  const loading = ref(false);
  const result = <Ref<Awaited<ReturnType<T>>>>ref();
  const call = function (promise: Promise<T>) {
    loading.value = true;

    promise
      .then(x => {
        result.value = <any>x;
      })
      .finally(() => {
        loading.value = false;
      });

    return promise;
  };

  return {
    loading,
    result,
    call,
  };
}