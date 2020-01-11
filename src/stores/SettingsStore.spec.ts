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
                gpgPath: '/foo'
            },
            deps
        );

    beforeEach(() => {
        deps = {
            ipcRenderer: {
                off: jest.fn(),
                on: jest.fn(),
                send: jest.fn()
            }
        };
        store = createStore();
    });

    it('initializes and registers handlers', () => {
        expect(deps.ipcRenderer.on.mock.calls[0][0]).toBe(
            Events.LOAD_SETTINGS_RESULT
        );
        expect(deps.ipcRenderer.on.mock.calls[0][1]).toBe(store.onLoadSettings);
    });

    it('sends load event', () => {
        store.load();
        expect(deps.ipcRenderer.send.mock.calls[0]).toEqual([
            Events.LOAD_SETTINGS
        ]);
    });

    it('sends save event', () => {
        store.save();
        expect(deps.ipcRenderer.send.mock.calls[0]).toEqual([
            Events.SAVE_SETTINGS,
            { gpgPath: '/foo' }
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
});
