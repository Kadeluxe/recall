import {Ref, ref} from "@vue/reactivity";

interface IUseRecallResult<T> {
  loading: Ref<boolean>;
  result: Ref<T>;
  promise: Promise<T>;
}

type UnPromisify<T> = T extends Promise<infer U> ? U : T;

export function useRecallResult<T>(promise: Promise<T>): IUseRecallResult<T> {
  const loading = ref(true);
  const result: Ref<T> = ref(null!);

  promise
    .then(response => {
      result.value = response;
    })
    .finally(() => {
      loading.value = false;
    });

  return {
    loading,
    result,
    promise,
  };
}