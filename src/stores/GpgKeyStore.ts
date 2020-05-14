import debug from 'debug';
import { flow, getEnv, Instance, types } from 'mobx-state-tree';

import { DeleteKeyResponse, Events } from '../Constants';

const log = debug('ezgpg:gpgKeyStore');

export const GpgKey = types.model('GpgKey', {
    email: types.maybe(types.string),
    id: types.identifier,
    name: types.maybe(types.string)
});
export type IGpgKey = Instance<typeof GpgKey>;

export const GpgKeyStore = types
    .model('GpgKeyStore', {
        gpgKeys: types.map(GpgKey),
        selectedKeys: types.array(types.reference(GpgKey))
    })
    .views((self) => ({
        get selectedKeyIds() {
            return self.selectedKeys.map((key) => key.id);
        },
        get sortedKeys() {
            return Array.from(self.gpgKeys.values()).sort(
                (a: IGpgKey, b: IGpgKey) => {
                    if (a.name === b.name) {
                        return a.id < b.id ? -1 : 1;
                    }
                    return (a.name ?? '') < (b.name ?? '') ? -1 : 1;
                }
            );
        }
    }))
    .actions((self) => {
        const updateKeys = (pubKeys: readonly IGpgKey[]) => {
            self.selectedKeys.clear();
            self.gpgKeys.clear();
            pubKeys.forEach((key) => self.gpgKeys.put(key));
        };

        return {
            load: flow(function* load() {
                log('requesting pub keys');
                const renderer = getEnv(self).ipcRenderer;
                const { pubKeys, error } = yield renderer.invoke(Events.KEYS);
                if (error) {
                    log('Error while getting pub keys: %O', error);
                }
                updateKeys(pubKeys);
            }),

            deleteKey: flow(function* deleteKey(id: string) {
                const renderer = getEnv(self).ipcRenderer;
                const {
                    keyId,
                    error
                }: DeleteKeyResponse = yield renderer.invoke(
                    Events.KEY_DELETE,
                    id
                );
                if (error) {
                    log('Error while deleting key %s: %O', keyId, error);
                } else {
                    self.selectedKeys.clear();
                    self.gpgKeys.delete(keyId);
                    log('Deleted key %s', keyId);
                }
            }),

            importKey: flow(function* importKey(key: string) {
                const { pubKeys, error } = yield getEnv(
                    self
                ).ipcRenderer.invoke(Events.KEY_IMPORT, key);
                if (error) {
                    log('Error while importing key: %O', error);
                } else {
                    updateKeys(pubKeys);
                }
            }),

            setSelectedKeys(names: string[]) {
                self.selectedKeys.clear();
                self.selectedKeys.push(
                    ...(names
                        .map((name) => self.gpgKeys.get(name))
                        .filter((gpgKey) => gpgKey !== undefined) as IGpgKey[])
                );
            }
        };
    });

export type IGpgKeyStore = Instance<typeof GpgKeyStore>;
