import { ipcMain, IpcMain, IpcMainEvent } from 'electron';

import { Events } from '../Constants';
import Gpg, { GpgError } from './Gpg';
import Main from './Main';

jest.mock('./Gpg');

type OnMockFn = (
    channel: string,
    listener: (event: IpcMainEvent, ...args: any[]) => void
) => IpcMain;

describe('Main', () => {
    let mockGpg: Gpg;
    let mockEvent: Electron.IpcMainEvent;
    let main: Main;

    beforeEach(() => {
        mockGpg = new Gpg();
        mockEvent = { reply: jest.fn() } as any;
        main = new Main(mockGpg);
    });

    it('should setup ipc events', () => {
        const onMock = (ipcMain.on as jest.MockedFunction<OnMockFn>).mock;
        main.setup();
        expect(onMock.calls[0][0]).toEqual(Events.PUBKEYS);
        expect(onMock.calls[0][1]).toBeInstanceOf(Function);
        expect(onMock.calls[1][0]).toEqual(Events.CRYPT);
        expect(onMock.calls[1][1]).toBeInstanceOf(Function);
    });

    describe('onRequestPubKeys', () => {
        it('handles request for public keys', async () => {
            (mockGpg.getPublicKeys as any).mockImplementation(async () => {
                return ['alpha', 'beta'];
            });

            await main.onRequestPubKeys(mockEvent);

            const mockReply = (mockEvent.reply as jest.Mock).mock;
            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([
                Events.PUBKEYS_RESULT,
                ['alpha', 'beta']
            ]);
        });

        it('handles request for public keys when gpg errors', async () => {
            (mockGpg.getPublicKeys as any).mockImplementation(async () => {
                throw new GpgError(2, 'error');
            });
            await main.onRequestPubKeys(mockEvent);
            const mockReply = (mockEvent.reply as jest.Mock).mock;
            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([Events.PUBKEYS_RESULT, []]);
        });
    });

    describe('onRequestCrypt', () => {
        it('encrypts unencrypted text', async () => {
            (mockGpg.encrypt as any).mockImplementation(async () => {
                return Promise.resolve('ENCRYPTED');
            });
            await main.onRequestCrypt(mockEvent, {
                recipients: ['alpha'],
                text: 'foobar'
            });
            const mockReply = (mockEvent.reply as jest.Mock).mock;
            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([
                Events.CRYPT_RESULT,
                { encrypted: true, text: 'ENCRYPTED' }
            ]);
        });

        it('decrypts encrypted text', async () => {
            (mockGpg as any).__setEncrypted(true);
            (mockGpg.decrypt as any).mockImplementation(async () => {
                return Promise.resolve('DECRYPTED');
            });
            await main.onRequestCrypt(mockEvent, {
                recipients: [],
                text: 'foobar'
            });
            const mockReply = (mockEvent.reply as jest.Mock).mock;
            expect(mockReply.calls).toHaveLength(1);
            expect(mockReply.calls[0]).toEqual([
                Events.CRYPT_RESULT,
                { encrypted: false, text: 'DECRYPTED' }
            ]);
        });
    });
});
