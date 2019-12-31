import { ipcRenderer } from 'electron';
import createRootStore, { RootStore } from './RootStore';
import { Events } from '../Constants';

type SendMockFn = jest.MockedFunction<
    (channel: string, ...args: any[]) => void
>;

describe('RootStore', () => {
    const createStore = () => {
        return RootStore.create(
            {
                gpgKeyStore: {
                    gpgKeys: {
                        alpha: {
                            id: 'alpha',
                            name: 'alpha user',
                            email: 'alpha@user.com'
                        }
                    },
                    selectedKeys: ['alpha']
                },
                cryptStore: {
                    input: {
                        val: 'input'
                    },
                    output: {
                        val: 'output'
                    },
                    pending: false
                }
            },
            {
                ipcRenderer: ipcRenderer
            }
        );
    };

    it('should send input for crypt', () => {
        createStore();
        expect((ipcRenderer.send as SendMockFn).mock.calls[0]).toEqual([
            Events.CRYPT,
            {
                text: 'input',
                recipients: ['alpha']
            }
        ]);
    });

    it('should be created by factory function', () => {
        const store = createRootStore(ipcRenderer);
        expect(store.gpgKeyStore).toBeDefined();
        expect(store.cryptStore).toBeDefined();
    });
});
