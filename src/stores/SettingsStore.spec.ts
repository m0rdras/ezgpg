import { Events } from '../Constants';
import { ISettingsStore, SettingsStore } from './SettingsStore';

describe('SettingsStore', () => {
    let deps: {
        ipcRenderer: { invoke: jest.Mock };
    };
    let store: ISettingsStore;

    const createStore = () =>
        SettingsStore.create(
            {
                gpgPath: '/foo'
            },
            deps
        );

    beforeEach(() => {
        deps = {
            ipcRenderer: {
                invoke: jest.fn()
            }
        };
        store = createStore();
    });

    it('sends load event', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(Promise.resolve());
        await store.load();
        expect(deps.ipcRenderer.invoke).toHaveBeenCalledWith(
            Events.LOAD_SETTINGS
        );
    });

    it('sends save event', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({ settings: {} })
        );
        await store.save();
        expect(
            deps.ipcRenderer.invoke
        ).toHaveBeenCalledWith(Events.SAVE_SETTINGS, { gpgPath: '/foo' });
    });

    it('correctly sets gpgPath property', () => {
        store.setGpgPath('/bar');
        expect(store.gpgPath).toEqual('/bar');
    });

    it('handles load event response', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({
                gpgPath: '/bar'
            })
        );
        await store.load();
        expect(store.gpgPath).toEqual('/bar');
    });

    it('handles save event response without error', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({
                settings: { gpgPath: '/foobar' }
            })
        );
        await store.save();
        expect(store.gpgPath).toEqual('/foobar');
    });

    it('clears previous errors', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({
                settings: { gpgPath: '/foobar' }
            })
        );
        store = SettingsStore.create(
            {
                gpgPath: '/foo',
                lastError: 'dummy error message'
            },
            deps
        );

        await store.save();

        expect(store.lastError).toBeUndefined();
    });

    it('handles errors in save settings response', async () => {
        deps.ipcRenderer.invoke.mockReturnValue(
            Promise.resolve({
                error: new Error('😱'),
                settings: { gpgPath: '/foobar' }
            })
        );
        await store.save();
        expect(store.lastError).toEqual('😱');
    });
});
