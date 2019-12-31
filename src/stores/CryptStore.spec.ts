import { Events } from '../Constants';
import { CryptStore } from './CryptStore';
import { destroy } from 'mobx-state-tree';
import Electron from 'electron';

describe('CryptStore', () => {
    let deps: {
        ipcRenderer: { on: jest.Mock; off: jest.Mock; send: jest.Mock };
    };

    const createStore = () =>
        CryptStore.create(
            {
                input: {
                    val: ''
                },
                output: {
                    val: ''
                },
                pending: false
            },
            deps
        );

    beforeEach(() => {
        deps = {
            ipcRenderer: {
                on: jest.fn(),
                off: jest.fn(),
                send: jest.fn()
            }
        };
    });

    it('initializes and registers handlers', () => {
        const store = createStore();
        expect(deps.ipcRenderer.on.mock.calls[0][0]).toBe(Events.CRYPT_RESULT);
        expect(deps.ipcRenderer.on.mock.calls[0][1]).toBe(
            store.handleGpgCryptResponse
        );
    });

    it('destroys and unregisters handler', () => {
        const store = createStore();
        destroy(store);
        expect(deps.ipcRenderer.off.mock.calls[0][0]).toBe(Events.CRYPT_RESULT);
        expect(deps.ipcRenderer.off.mock.calls[0][1]).toBe(
            store.handleGpgCryptResponse
        );
    });

    it('sets pending flag', () => {
        const store = createStore();
        expect(store.pending).toBe(false);
        store.setPending(true);
        expect(store.pending).toBe(true);
        store.setPending(false);
        expect(store.pending).toBe(false);
    });

    it('handles crypt response', () => {
        const store = createStore();
        store.setPending(true);
        store.handleGpgCryptResponse({} as Electron.IpcRendererEvent, {
            text: 'crypted',
            encrypted: true
        });
        expect(store.pending).toBe(false);
        expect(store.output.val).toEqual('crypted');
    });
});
