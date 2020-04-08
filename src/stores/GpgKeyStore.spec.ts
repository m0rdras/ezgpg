import { destroy } from 'mobx-state-tree';

import { Events } from '../Constants';
import { GpgKeyStore, IGpgKeyStore } from './GpgKeyStore';

describe('GpgKeyStore', () => {
    let deps: {
        ipcRenderer: { on: jest.Mock; off: jest.Mock; send: jest.Mock };
    };
    let store: IGpgKeyStore;

    const createStore = (gpgKeys = {}, selectedKeys = []) =>
        GpgKeyStore.create({ gpgKeys, selectedKeys }, deps);

    beforeEach(() => {
        deps = {
            ipcRenderer: {
                off: jest.fn(),
                on: jest.fn(),
                send: jest.fn()
            }
        };
    });

    it('initializes and registers handler', () => {
        store = createStore();
        expect(deps.ipcRenderer.on.mock.calls[0][0]).toBe(
            Events.PUBKEYS_RESULT
        );
        expect(deps.ipcRenderer.on.mock.calls[0][1]).toBe(
            store.onGpgKeyResponse
        );
    });

    it('destroys and unregisters handler', () => {
        store = createStore();
        destroy(store);
        expect(deps.ipcRenderer.off.mock.calls[0][0]).toBe(
            Events.PUBKEYS_RESULT
        );
        expect(deps.ipcRenderer.off.mock.calls[0][1]).toBe(
            store.onGpgKeyResponse
        );
    });

    it('sends IPC message to load data', () => {
        store = createStore();
        store.load();
        expect(deps.ipcRenderer.send.mock.calls[0][0]).toBe(Events.PUBKEYS);
    });

    it('handles response correctly', () => {
        store = createStore();
        store.onGpgKeyResponse({} as Electron.IpcRendererEvent, {
            pubKeys: [
                { id: '1', name: 'one', email: 'one@dev.local' },
                { id: '2', name: 'two', email: 'two@dev.local' }
            ]
        });
        expect(store.gpgKeys.get('1')).toEqual({
            email: 'one@dev.local',
            id: '1',
            name: 'one'
        });
        expect(store.gpgKeys.get('2')).toEqual({
            email: 'two@dev.local',
            id: '2',
            name: 'two'
        });
        expect(store.gpgKeys.size).toBe(2);
    });

    it('handles error in response correctly', () => {
        store = createStore({
            1: { id: '1', name: 'beta', email: 'beta@dev.local' }
        });
        store.onGpgKeyResponse({} as Electron.IpcRendererEvent, {
            pubKeys: [],
            error: new Error('😱')
        });

        expect(store.gpgKeys.size).toBe(0);
    });

    it('correctly sorts keys', () => {
        store = createStore({
            1: { id: '1', name: 'beta', email: 'beta@dev.local' },
            2: { id: '2', name: 'alpha', email: 'alpha@dev.local' }
        });
        expect(store.sortedKeys).toEqual([
            { id: '2', name: 'alpha', email: 'alpha@dev.local' },
            { id: '1', name: 'beta', email: 'beta@dev.local' }
        ]);
    });

    it('correctly sorts keys with duplicate names', () => {
        store = createStore({
            abc: { id: 'abc', name: 'alpha', email: 'alpha@dev.local' },
            def: { id: 'def', name: 'alpha', email: 'alpha@dev.local' }
        });
        expect(store.sortedKeys).toEqual([
            { id: 'abc', name: 'alpha', email: 'alpha@dev.local' },
            { id: 'def', name: 'alpha', email: 'alpha@dev.local' }
        ]);
    });

    it('sets selected keys', () => {
        store = createStore({
            1: { id: '1', name: 'alpha', email: 'beta@dev.local' },
            2: { id: '2', name: 'beta', email: 'alpha@dev.local' }
        });
        store.setSelectedKeys(['2', '3']);
        expect(store.selectedKeys).toEqual([
            { id: '2', name: 'beta', email: 'alpha@dev.local' }
        ]);
    });
});
