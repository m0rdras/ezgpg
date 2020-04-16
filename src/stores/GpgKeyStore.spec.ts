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

    it('knows about all handlers', () => {
        store = createStore();
        expect(store.getHandlers()).toEqual([
            [Events.PUBKEYS_RESULT, store.onGpgKeyResponse],
            [Events.PUBKEY_DELETE, store.onDeleteKeyResponse]
        ]);
    });

    it('initializes and registers handler', () => {
        store = createStore();

        expect(deps.ipcRenderer.on).toHaveBeenCalledTimes(2);
        expect(deps.ipcRenderer.on).toHaveBeenCalledWith(
            Events.PUBKEYS_RESULT,
            store.onGpgKeyResponse
        );
        expect(deps.ipcRenderer.on).toHaveBeenCalledWith(
            Events.PUBKEY_DELETE,
            store.onDeleteKeyResponse
        );
    });

    it('destroys and unregisters handler', () => {
        store = createStore();
        destroy(store);

        expect(deps.ipcRenderer.off).toHaveBeenCalledTimes(2);
        expect(deps.ipcRenderer.off).toHaveBeenCalledWith(
            Events.PUBKEYS_RESULT,
            store.onGpgKeyResponse
        );
        expect(deps.ipcRenderer.off).toHaveBeenCalledWith(
            Events.PUBKEY_DELETE,
            store.onDeleteKeyResponse
        );
    });

    it('sends IPC message to load data', () => {
        store = createStore();
        store.load();

        expect(deps.ipcRenderer.send).toHaveBeenCalledWith(Events.PUBKEYS);
    });

    it('handles pubkey response correctly', () => {
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

    it('handles error in pubkey response correctly', () => {
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

    it('sends IPC message to delete key', () => {
        store = createStore();
        store.deleteKey('foo');

        expect(deps.ipcRenderer.send).toHaveBeenCalledWith(
            Events.PUBKEY_DELETE,
            'foo'
        );
    });

    it('handles successful delete key response', () => {
        store = createStore();

        store.onDeleteKeyResponse({} as Electron.IpcRendererEvent, {
            keyId: 'foo'
        });

        expect(deps.ipcRenderer.send).toHaveBeenCalledWith(Events.PUBKEYS);
    });

    it('handles unsuccessful delete key response', () => {
        store = createStore();

        store.onDeleteKeyResponse({} as Electron.IpcRendererEvent, {
            keyId: 'foo',
            error: new Error('fail')
        });

        expect(deps.ipcRenderer.send).toHaveBeenCalledWith(Events.PUBKEYS);
    });
});
