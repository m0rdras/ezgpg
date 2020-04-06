import { ipcMain, IpcMainEvent } from 'electron';
import ElectronStore from 'electron-store';

import { Events, StoreKeys } from '../Constants';
import Gpg, { GpgError } from './Gpg';
import Main from './Main';

jest.mock('./Gpg');

describe('Main', () => {
    let mockGpg: Gpg;
    let mockEvent: IpcMainEvent;
    let mockStore: ElectronStore;
    let mockSettings: { [key: string]: string };

    let main: Main;
    let mockReply: jest.MockContext<
        (channel: string, ...args: any) => void,
        any[]
    >;

    beforeEach(() => {
        mockGpg = new Gpg();
        const reply = jest.fn();
        mockReply = reply.mock as any;
        mockEvent = { reply } as any;
        mockSettings = {};
        mockStore = {
            get: jest.fn().mockImplementation(() => mockSettings),
            set: jest
                .fn()
                .mockImplementation((key, val) => (mockSettings = val)),
        } as any;
        main = Main.setup(mockGpg, mockStore);
        (mockGpg as any).__setEncrypted(false);
    });

    it('should setup ipc events', () => {
        const onMock = (ipcMain.on as jest.Mock).mock;

        expect(onMock.calls[0][0]).toEqual(Events.PUBKEYS);
        expect(onMock.calls[0][1]).toBeInstanceOf(Function);
        expect(onMock.calls[1][0]).toEqual(Events.CRYPT);
        expect(onMock.calls[1][1]).toBeInstanceOf(Function);
    });

    describe('gpg path handling', () => {
        it('should not apply wrong gpg executable config', () => {
            expect(() => {
                main.applySettings({ gpgPath: '/invalid/path/to/file' });
            }).toThrow(
                'Could not set executable path to /invalid/path/to/file'
            );
        });

        it('should reply with an error when invalid gpg path was given', () => {
            mockStore.get = jest
                .fn()
                .mockReturnValue({ gpgPath: '/valid/path' });

            main.onSaveSettings(mockEvent, {
                gpgPath: '/invalid/path/to/file',
            });

            expect(mockStore.get).toHaveBeenCalledWith(StoreKeys.SETTINGS);
            expect(mockEvent.reply).toHaveBeenCalledWith(
                Events.SAVE_SETTINGS_RESULT,
                {
                    error: new Error(
                        'Could not set executable path to /invalid/path/to/file'
                    ),
                    settings: { gpgPath: '/valid/path' },
                }
            );
        });

        it('should correctly initialize on clean startup', () => {
            mockStore.get = jest.fn().mockReturnValue({});
            (mockGpg.detectExecutablePath as jest.Mock).mockReturnValue(
                '/valid/gpg'
            );

            Main.initGpgPath(mockGpg, mockStore);

            expect(mockStore.set as jest.Mock).toHaveBeenCalledWith(
                StoreKeys.SETTINGS,
                {
                    gpgPath: '/valid/gpg',
                }
            );
        });

        it('should correctly initialize with invalid config', () => {
            mockStore.get = jest
                .fn()
                .mockReturnValue({ gpgPath: '/invalid/path' });
            (mockGpg.detectExecutablePath as jest.Mock).mockReturnValue(
                '/valid/gpg'
            );
            (mockGpg.setExecutablePath as jest.Mock).mockReturnValue(false);

            Main.initGpgPath(mockGpg, mockStore);

            expect(mockStore.set as jest.Mock).toHaveBeenCalledWith(
                StoreKeys.SETTINGS,
                {
                    gpgPath: '/valid/gpg',
                }
            );
        });
    });

    describe('onRequestPubKeys', () => {
        it('handles request for public keys', async () => {
            (mockGpg.getPublicKeys as jest.Mock).mockImplementation(
                async () => {
                    return ['alpha', 'beta'];
                }
            );

            await main.onRequestPubKeys(mockEvent);

            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([
                Events.PUBKEYS_RESULT,
                { pubKeys: ['alpha', 'beta'] },
            ]);
        });

        it('handles request for public keys when gpg errors', async () => {
            const expectedError = new GpgError(2, 'error');
            (mockGpg.getPublicKeys as any).mockImplementation(async () => {
                throw expectedError;
            });

            await main.onRequestPubKeys(mockEvent);

            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([
                Events.PUBKEYS_RESULT,
                { pubKeys: [], error: expectedError },
            ]);
        });
    });

    describe('onRequestCrypt', () => {
        it('encrypts unencrypted text', async () => {
            (mockGpg.encrypt as any).mockImplementation(async () => {
                return Promise.resolve('ENCRYPTED');
            });

            await main.onRequestCrypt(mockEvent, {
                recipients: ['alpha'],
                text: 'foobar',
            });

            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([
                Events.CRYPT_RESULT,
                { encrypted: true, text: 'ENCRYPTED' },
            ]);
        });

        it('decrypts encrypted text', async () => {
            (mockGpg as any).__setEncrypted(true);
            (mockGpg.decrypt as any).mockImplementation(async () => {
                return Promise.resolve('DECRYPTED');
            });

            await main.onRequestCrypt(mockEvent, {
                recipients: [],
                text: 'foobar',
            });

            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([
                Events.CRYPT_RESULT,
                { encrypted: false, text: 'DECRYPTED' },
            ]);
        });

        it('handles empty text', async () => {
            await main.onRequestCrypt(mockEvent, {
                recipients: ['alpha'],
                text: '',
            });

            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([
                Events.CRYPT_RESULT,
                { encrypted: false, text: '' },
            ]);
        });

        it('handles empty recipient list', async () => {
            await main.onRequestCrypt(mockEvent, {
                recipients: [],
                text: 'encrypt me plz!',
            });

            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([
                Events.CRYPT_RESULT,
                { encrypted: false, text: '' },
            ]);
        });
    });

    describe('with settings', () => {
        it('loads from store', () => {
            (mockStore.get as jest.Mock).mockReturnValue('settings');

            main.onLoadSettings(mockEvent);

            expect((mockStore.get as jest.Mock).mock.calls[0][0]).toEqual(
                StoreKeys.SETTINGS
            );
            expect((mockEvent.reply as jest.Mock).mock.calls[0]).toEqual([
                Events.LOAD_SETTINGS_RESULT,
                'settings',
            ]);
        });

        it('saves to store and applies settings', () => {
            const settings = { gpgPath: __filename };
            (mockGpg.setExecutablePath as jest.Mock).mockReturnValue(true);

            main.onSaveSettings(mockEvent, settings);

            expect(mockSettings).toEqual(settings);
            expect(mockGpg.setExecutablePath).toHaveBeenCalledWith(__filename);
        });

        it('does not try to apply empty settings', () => {
            const gpgPath = (mockGpg.gpgPath = '/foo');

            main.applySettings(undefined as any);

            expect(mockGpg.gpgPath).toEqual(gpgPath);
        });
    });
});
