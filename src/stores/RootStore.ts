import debug from 'debug';
import { ipcRenderer } from 'electron';
import { autorun, IReactionDisposer } from 'mobx';
import { getEnv, Instance, SnapshotIn, types } from 'mobx-state-tree';

import { Events } from '../Constants';
import { CryptStore } from './CryptStore';
import { GpgKeyStore } from './GpgKeyStore';

const log = debug('ezgpg:rootStore');

export const RootStore = types
    .model('RootStore', {
        cryptStore: CryptStore,
        gpgKeyStore: GpgKeyStore
    })
    .actions(self => {
        let disposer: IReactionDisposer;

        const onInputChange = () => {
            const payload = {
                recipients: self.gpgKeyStore.selectedKeyIds,
                text: self.cryptStore.input.val
            };
            log('Sending to main: %O', payload);
            self.cryptStore.setPending(true);
            getEnv(self).ipcRenderer.send(Events.CRYPT, payload);
        };

        return {
            afterCreate() {
                disposer = autorun(() => onInputChange());
            },
            beforeDestroy() {
                disposer();
            }
        };
    });
export interface IRootStore extends Instance<typeof RootStore> {}

export default function createRootStore(ipc = ipcRenderer) {
    const snapshot: SnapshotIn<typeof RootStore> = {
        cryptStore: {
            input: {
                val: ''
            },
            output: {
                val: ''
            },
            pending: false
        },
        gpgKeyStore: {
            gpgKeys: {},
            selectedKeys: []
        }
    };
    const deps = { ipcRenderer: ipc };
    return RootStore.create(snapshot, deps);
}
