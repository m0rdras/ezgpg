import { Events } from '../Constants';
import { ISettingsStore, SettingsStore } from './SettingsStore';

describe('SettingsStore', () => {
    let deps: {
        ipcRenderer: { on: jest.Mock; off: jest.Mock; send: jest.Mock };
    };
    let store: ISettingsStore;

    const createStore = () =>
        SettingsStore.create(
            {
                gpgPath: '/foo',
            },
            deps
        );

    beforeEach(() => {
        deps = {
            ipcRenderer: {
                off: jest.fn(),
                on: jest.fn(),
                send: jest.fn(),
            },
        };
        store = createStore();
    });

    it('initializes and registers handlers', () => {
        const [call1, call2] = deps.ipcRenderer.on.mock.calls;
        expect(call1[0]).toBe(Events.LOAD_SETTINGS_RESULT);
        expect(call1[1]).toBe(store.onLoadSettings);
        expect(call2[0]).toBe(Events.SAVE_SETTINGS_RESULT);
        expect(call2[1]).toBe(store.onSaveSettings);
    });

    it('sends load event', () => {
        store.load();
        expect(deps.ipcRenderer.send.mock.calls[0]).toEqual([
            Events.LOAD_SETTINGS,
        ]);
    });

    it('sends save event', () => {
        store.save();
        expect(deps.ipcRenderer.send.mock.calls[0]).toEqual([
            Events.SAVE_SETTINGS,
            { gpgPath: '/foo' },
        ]);
    });

    it('correctly sets gpgPath property', () => {
        store.setGpgPath('/bar');
        expect(store.gpgPath).toEqual('/bar');
    });

    it('handles load event response', () => {
        store.onLoadSettings(undefined as any, { gpgPath: '/bar' });
        expect(store.gpgPath).toEqual('/bar');
    });

    it('handles save event response without error', () => {
        store.onSaveSettings(undefined as any, {
            settings: { gpgPath: '/foobar' },
        });
        expect(store.gpgPath).toEqual('/foobar');
    });

    it('clears previous errors', () => {
        store = SettingsStore.create(
            {
                gpgPath: '/foo',
                lastError: 'dummy error message',
            },
            deps
        );
        store.onSaveSettings(undefined as any, {
            settings: { gpgPath: '/foobar' },
        });
        expect(store.lastError).toBeUndefined();
    });

    it('handles errors in save settings response', () => {
        store.onSaveSettings(undefined as any, {
            error: new Error('😱'),
            settings: { gpgPath: '/foobar' },
        });
        expect(store.lastError).toEqual('😱');
    });
});
