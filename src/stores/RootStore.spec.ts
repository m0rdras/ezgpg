import { ipcRenderer } from 'electron';
import { destroy } from 'mobx-state-tree';

import { Events } from '../Constants';
import createRootStore, { RootStore } from './RootStore';

type SendMockFn = jest.MockedFunction<
    (channel: string, ...args: any[]) => void
>;

jest.mock('electron');

describe('RootStore', () => {
    const createStore = () => {
        return RootStore.create(
            {
                cryptStore: {
                    input: {
                        val: 'input'
                    },
                    output: {
                        val: 'output'
                    },
                    pending: false
                },
                gpgKeyStore: {
                    gpgKeys: {
                        alpha: {
                            email: 'alpha@user.com',
                            id: 'alpha',
                            name: 'alpha user'
                        }
                    },
                    selectedKeys: ['alpha']
                },
                settingsStore: {
                    gpgPath: '/foo/bar/gpg'
                }
            },
            {
                ipcRenderer
            }
        );
    };

    it('should send input for crypt', () => {
        createStore();
        expect((ipcRenderer.send as SendMockFn).mock.calls[0]).toEqual([
            Events.CRYPT,
            {
                recipients: ['alpha'],
                text: 'input'
            }
        ]);
    });

    it('should be created by factory function', () => {
        const store = createRootStore(ipcRenderer);
        expect(store.gpgKeyStore).toBeDefined();
        expect(store.cryptStore).toBeDefined();
    });

    it('should be destructible', () => {
        const store = createStore();
        destroy(store);
    });

    it('should initialize loading of sub-stores', () => {
        const store = createStore();

        store.load();

        expect(ipcRenderer.send as jest.Mock).toHaveBeenCalledWith(
            Events.PUBKEYS
        );
        expect(ipcRenderer.send as jest.Mock).toHaveBeenCalledWith(
            Events.LOAD_SETTINGS
        );
    });
});
