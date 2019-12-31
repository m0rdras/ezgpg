import debug from 'debug';
import { getEnv, Instance, SnapshotIn, types } from 'mobx-state-tree';
import { CryptStore } from './CryptStore';
import { GpgKeyStore } from './GpgKeyStore';
import { ipcRenderer } from 'electron';
import { autorun, IReactionDisposer } from 'mobx';
import { Events } from '../Constants';

const log = debug('ezgpg:rootStore');

export const RootStore = types
    .model('RootStore', {
        gpgKeyStore: GpgKeyStore,
        cryptStore: CryptStore
    })
    .actions(self => {
        let disposer: IReactionDisposer;

        const onInputChange = () => {
            const payload = {
                text: self.cryptStore.input.val,
                recipients: self.gpgKeyStore.selectedKeyIds
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
        gpgKeyStore: {
            gpgKeys: {},
            selectedKeys: []
        },
        cryptStore: {
            input: {
                val: ''
            },
            output: {
                val: ''
            },
            pending: false
        }
    };
    const deps = { ipcRenderer: ipc };
    return RootStore.create(snapshot, deps);
}
