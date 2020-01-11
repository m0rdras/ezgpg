import debug from 'debug';
import { getEnv, Instance, types } from 'mobx-state-tree';

import { Events } from '../Constants';

const log = debug('ezgpg:gpgKeyStore');

export const GpgKey = types.model('GpgKey', {
    email: types.maybe(types.string),
    id: types.identifier,
    name: types.maybe(types.string)
});
export interface IGpgKey extends Instance<typeof GpgKey> {}

export const GpgKeyStore = types
    .model('GpgKeyStore', {
        gpgKeys: types.map(GpgKey),
        selectedKeys: types.array(types.reference(GpgKey))
    })
    .views(self => ({
        get selectedKeyIds() {
            return self.selectedKeys.map(key => key.id);
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
    .actions(self => ({
        afterCreate() {
            getEnv(self).ipcRenderer.on(
                Events.PUBKEYS_RESULT,
                this.onGpgKeyResponse
            );
        },

        beforeDestroy() {
            getEnv(self).ipcRenderer.off(
                Events.PUBKEYS_RESULT,
                this.onGpgKeyResponse
            );
        },

        onGpgKeyResponse(
            event: Electron.IpcRendererEvent,
            { pubKeys, error }: { pubKeys: IGpgKey[]; error?: Error }
        ) {
            self.gpgKeys.clear();
            if (error) {
                log('Error while getting pub keys: %O', error);
                return;
            }
            log('received %d pub keys: %O', pubKeys.length, pubKeys);
            pubKeys.forEach(key => self.gpgKeys.put(key));
        },

        load() {
            log('requesting pub keys');
            getEnv(self).ipcRenderer.send(Events.PUBKEYS);
        },

        setSelectedKeys(names: string[]) {
            self.selectedKeys.clear();
            self.selectedKeys.push(
                ...(names
                    .map(name => self.gpgKeys.get(name))
                    .filter(gpgKey => gpgKey !== undefined) as IGpgKey[])
            );
        }
    }));

export interface IGpgKeyStore extends Instance<typeof GpgKeyStore> {}
