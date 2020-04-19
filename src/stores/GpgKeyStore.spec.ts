import { Events } from '../Constants';
import { GpgKeyStore, IGpgKeyStore } from './GpgKeyStore';

describe('GpgKeyStore', () => {
    let deps: {
        ipcRenderer: { invoke: jest.Mock };
    };
    let store: IGpgKeyStore;

    const createStore = (gpgKeys = {}, selectedKeys = []) =>
        GpgKeyStore.create({ gpgKeys, selectedKeys }, deps);

    beforeEach(() => {
        deps = {
            ipcRenderer: {
                invoke: jest.fn()
            }
        };
    });

    it('sends IPC message to load data', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({ pubKeys: [] })
        );
        store = createStore();
        await store.load();

        expect(deps.ipcRenderer.invoke).toHaveBeenCalledWith(Events.KEYS);
    });

    it('handles pubkey response correctly', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({
                pubKeys: [
                    { id: '1', name: 'one', email: 'one@dev.local' },
                    { id: '2', name: 'two', email: 'two@dev.local' }
                ]
            })
        );
        store = createStore();

        await store.load();

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

    it('handles error in pubkey response correctly', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({
                pubKeys: [],
                error: new Error('😱')
            })
        );
        store = createStore({
            1: { id: '1', name: 'beta', email: 'beta@dev.local' }
        });

        await store.load();

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

    it('sends IPC message to delete key', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({
                keyId: 'foo'
            })
        );
        store = createStore();
        await store.deleteKey('foo');

        expect(deps.ipcRenderer.invoke).toHaveBeenCalledWith(
            Events.KEY_DELETE,
            'foo'
        );
    });

    it('handles successful delete key response', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({
                keyId: '1'
            })
        );
        store = createStore({
            1: { id: '1', name: 'beta', email: 'beta@dev.local' },
            2: { id: '2', name: 'alpha', email: 'alpha@dev.local' }
        });

        await store.deleteKey('1');

        expect(store.gpgKeys.get('1')).toBeUndefined();
    });

    it('handles unsuccessful delete key response', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({
                keyId: 'foo',
                error: new Error('fail')
            })
        );
        store = createStore({
            1: { id: '1', name: 'beta', email: 'beta@dev.local' },
            2: { id: '2', name: 'alpha', email: 'alpha@dev.local' }
        });

        await store.deleteKey('1');

        expect(store.gpgKeys.get('1')).toEqual({
            id: '1',
            name: 'beta',
            email: 'beta@dev.local'
        });
    });
});
