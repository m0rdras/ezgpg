import { Events } from '../Constants';
import createRootStore, { IRootStore, RootStore } from './RootStore';

describe('RootStore', () => {
    let ipcRendererMock: { invoke: jest.Mock };
    let rootStore: IRootStore;

    beforeEach(() => {
        ipcRendererMock = { invoke: jest.fn() };
        ipcRendererMock.invoke.mockReturnValue(
            Promise.resolve({ text: '', pubKeys: [] })
        );
    });

    it('should be created by factory function', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const store = createRootStore(ipcRendererMock as any);
        expect(store.gpgKeyStore).toBeDefined();
        expect(store.cryptStore).toBeDefined();
    });

    describe('without factory function', () => {
        beforeEach(() => {
            rootStore = RootStore.create(
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
                        selectedKeys: []
                    },
                    settingsStore: {
                        gpgPath: '/foo/bar/gpg'
                    }
                },
                {
                    ipcRenderer: ipcRendererMock
                }
            );
            rootStore.gpgKeyStore.setSelectedKeys(['alpha']);
        });

        it('should send input for crypt', () => {
            expect(ipcRendererMock.invoke).toHaveBeenCalledWith(Events.CRYPT, {
                recipients: ['alpha'],
                text: 'input'
            });
        });

        it('should initialize loading of sub-stores', async () => {
            await rootStore.load();

            expect(ipcRendererMock.invoke).toHaveBeenCalledWith(Events.KEYS);
            expect(ipcRendererMock.invoke).toHaveBeenCalledWith(
                Events.LOAD_SETTINGS
            );
        });
    });
});
