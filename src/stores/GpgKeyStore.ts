import debug from 'debug';
import { getEnv, Instance, types } from 'mobx-state-tree';

import { Events } from '../Constants';

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
    .actions((self) => ({
        getHandlers() {
            return [
                [Events.KEYS_RESULT, this.onGpgKeyResponse],
                [Events.KEY_DELETE, this.onDeleteKeyResponse]
            ];
        },

        afterCreate() {
            this.getHandlers().forEach(([channel, handler]) =>
                getEnv(self).ipcRenderer.on(channel, handler)
            );
        },

        beforeDestroy() {
            this.getHandlers().forEach(([channel, handler]) =>
                getEnv(self).ipcRenderer.off(channel, handler)
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
            pubKeys.forEach((key) => self.gpgKeys.put(key));
        },

        load() {
            log('requesting pub keys');
            getEnv(self).ipcRenderer.send(Events.KEYS);
        },

        deleteKey(id: string) {
            getEnv(self).ipcRenderer.send(Events.KEY_DELETE, id);
        },

        importKey(key: string) {
            log('trying to import key: %s', key);
            getEnv(self).ipcRenderer.send(Events.KEY_IMPORT, key);
        },

        onDeleteKeyResponse(
            event: Electron.IpcRendererEvent,
            { keyId, error }: { keyId: string; error?: Error }
        ) {
            if (error) {
                log('Error while deleting key %s: %O', keyId, error);
            } else {
                log('Deleted key %s', keyId);
            }
            this.load();
        },

        setSelectedKeys(names: string[]) {
            self.selectedKeys.clear();
            self.selectedKeys.push(
                ...(names
                    .map((name) => self.gpgKeys.get(name))
                    .filter((gpgKey) => gpgKey !== undefined) as IGpgKey[])
            );
        }
    }));

export type IGpgKeyStore = Instance<typeof GpgKeyStore>;
