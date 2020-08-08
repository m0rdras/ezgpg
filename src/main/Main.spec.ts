import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ElectronStore from 'electron-store';

import { Events } from '../Constants';
import Gpg, { GpgError } from './Gpg';
import Main from './Main';
import { Settings } from '../stores/SettingsStore';

jest.mock('electron-store');
jest.mock('./Gpg');

describe('Main', () => {
    let mockGpg: Gpg;
    let mockStore: ElectronStore<Settings>;
    let main: Main;

    beforeEach(() => {
        mockGpg = new Gpg();
        mockStore = new ElectronStore<Settings>();
        // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-explicit-any
        (mockGpg as any).__setEncrypted(false);
    });

    it('should construct properly', () => {
        main = new Main();
        expect(main).toBeInstanceOf(Main);
    });

    describe('after setup', () => {
        let mockEvent: IpcMainInvokeEvent;

        beforeEach(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockEvent = {} as any;
            main = Main.setup(mockGpg, mockStore);
        });

        it('should have set up ipc events', () => {
            expect(ipcMain.handle).toHaveBeenCalledTimes(6);

            expect(ipcMain.handle).toHaveBeenCalledWith(
                Events.KEYS,
                expect.anything()
            );
            expect(ipcMain.handle).toHaveBeenCalledWith(
                Events.KEY_DELETE,
                expect.anything()
            );
            expect(ipcMain.handle).toHaveBeenCalledWith(
                Events.KEY_IMPORT,
                expect.anything()
            );
            expect(ipcMain.handle).toHaveBeenCalledWith(
                Events.CRYPT,
                expect.anything()
            );
            expect(ipcMain.handle).toHaveBeenCalledWith(
                Events.LOAD_SETTINGS,
                expect.anything()
            );
            expect(ipcMain.handle).toHaveBeenCalledWith(
                Events.SAVE_SETTINGS,
                expect.anything()
            );
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
                const origSettings = { gpgPath: '/valid/path' };
                mockStore.store = origSettings;

                const response = main.onSaveSettings(mockEvent, {
                    gpgPath: '/invalid/path/to/file'
                });

                expect(response.settings).toEqual(origSettings);
                expect(response.error).toEqual(
                    new Error(
                        'Could not set executable path to /invalid/path/to/file'
                    )
                );
            });
        });

        describe('onRequestPubKeys', () => {
            it('handles request for public keys', async () => {
                (mockGpg.getPublicKeys as jest.Mock).mockImplementation(
                    async () => {
                        return Promise.resolve(['alpha', 'beta']);
                    }
                );

                const response = await main.onRequestPubKeys();

                expect(response).toEqual({ pubKeys: ['alpha', 'beta'] });
            });

            it('handles request for public keys when gpg errors', async () => {
                const expectedError = new GpgError(2, 'error');
                (mockGpg.getPublicKeys as jest.Mock).mockImplementation(() => {
                    throw expectedError;
                });

                const response = await main.onRequestPubKeys();

                expect(response).toEqual({
                    pubKeys: [],
                    error: expectedError
                });
            });
        });

        describe('onDeletePubKey', () => {
            it('replies on successfully deleting a key', async () => {
                (mockGpg.deleteKey as jest.Mock).mockReturnValue(
                    Promise.resolve()
                );

                const response = await main.onDeleteKey(mockEvent, 'key-id');

                expect(response).toEqual({
                    keyId: 'key-id'
                });
            });

            it('replies with error when deleting fails', async () => {
                const error = new Error('epic fail');
                (mockGpg.deleteKey as jest.Mock).mockImplementation(() =>
                    Promise.reject(error)
                );

                const response = await main.onDeleteKey(mockEvent, 'key-id');

                expect(response).toEqual({
                    keyId: 'key-id',
                    error
                });
            });
        });

        describe('onRequestCrypt', () => {
            it('encrypts unencrypted text', async () => {
                (mockGpg.encrypt as jest.Mock).mockImplementation(() => {
                    return Promise.resolve('ENCRYPTED');
                });

                const response = await main.onRequestCrypt(mockEvent, {
                    recipients: ['alpha'],
                    text: 'foobar'
                });

                expect(response).toEqual({
                    encrypted: true,
                    text: 'ENCRYPTED'
                });
            });

            it('decrypts encrypted text', async () => {
                // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-explicit-any
                (mockGpg as any).__setEncrypted(true);
                (mockGpg.decrypt as jest.Mock).mockImplementation(() => {
                    return Promise.resolve('DECRYPTED');
                });

                const response = await main.onRequestCrypt(mockEvent, {
                    recipients: [],
                    text: 'foobar'
                });

                expect(response).toEqual({
                    encrypted: false,
                    text: 'DECRYPTED'
                });
            });

            it('handles empty text', async () => {
                const response = await main.onRequestCrypt(mockEvent, {
                    recipients: ['alpha'],
                    text: ''
                });

                expect(response).toEqual({
                    encrypted: false,
                    text: ''
                });
            });

            it('handles empty recipient list', async () => {
                const response = await main.onRequestCrypt(mockEvent, {
                    recipients: [],
                    text: 'encrypt me plz!'
                });

                expect(response).toEqual({
                    encrypted: false,
                    text: ''
                });
            });
        });

        describe('with settings', () => {
            it('does not try to apply empty settings', () => {
                const gpgPath = (mockGpg.gpgPath = '/foo');

                main.applySettings({} as Settings);

                expect(mockGpg.gpgPath).toEqual(gpgPath);
            });
        });
    });
});
