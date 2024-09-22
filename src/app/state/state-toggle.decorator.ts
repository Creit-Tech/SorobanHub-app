import { setProp, Store } from '@ngneat/elf';
import { UIEntitiesRef, upsertEntities } from '@ngneat/elf-entities';

export function StateToggleDecoratorFactory<Props extends object>(store: Store, path: keyof Props) {
  return function (target: object, key: string | undefined, descriptor: PropertyDescriptor) {
    const oldFunc = descriptor.value;
    descriptor.value = async function () {
      store.update(setProp(path, true));
      return (
        oldFunc
          // eslint-disable-next-line prefer-rest-params
          .apply(this, arguments)
          .then((result: never) => {
            store.update(setProp(path, false));
            return result;
          })
          .catch((err: never) => {
            store.update(setProp(path, false));
            return Promise.reject(err);
          })
      );
    };
  };
}

export function EntityStateToggleDecoratorFactory<EntityProps extends object>(
  store: Store,
  path: keyof EntityProps,
  isUIEntity?: boolean
) {
  return (idPath?: string, position: number = 0) => {
    return function (target: object, key: string | undefined, descriptor: PropertyDescriptor) {
      const oldFunc = descriptor.value;
      descriptor.value = async function (...args: never[]) {
        const _id = idPath
          ? idPath.split('.').reduce((a: string, b: string) => a[parseInt(b)], args[position])
          : args[position];

        function updateState(_id: string, state: boolean) {
          if (!isUIEntity) store.update(upsertEntities([{ _id, [path]: state }]));
          else store.update(upsertEntities([{ _id, [path]: state }], { ref: UIEntitiesRef }));
        }

        updateState(_id, true);
        return (
          oldFunc
            // eslint-disable-next-line prefer-rest-params
            .apply(this, arguments)
            .then((result: never) => {
              updateState(_id, false);
              return result;
            })
            .catch((err: never) => {
              updateState(_id, false);
              return Promise.reject(err);
            })
        );
      };
    };
  };
}
