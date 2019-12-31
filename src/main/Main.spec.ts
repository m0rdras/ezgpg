import { ipcMain, IpcMain, IpcMainEvent } from 'electron';

import { Events } from '../Constants';
import { GpgError } from './Gpg';
import Main from './Main';

type OnMockFn = (
    channel: string,
    listener: (event: IpcMainEvent, ...args: any[]) => void
) => IpcMain;

describe('Main', () => {
    it('should setup ipc events', () => {
        const onMock = (ipcMain.on as jest.MockedFunction<OnMockFn>).mock;

        const main = new Main();
        main.setup();
        expect(onMock.calls[0][0]).toEqual(Events.PUBKEYS);
        expect(onMock.calls[0][1]).toBeInstanceOf(Function);
        expect(onMock.calls[1][0]).toEqual(Events.CRYPT);
        expect(onMock.calls[1][1]).toBeInstanceOf(Function);
    });

    describe('onRequestPubKeys', () => {
        it('handles request for public keys', async () => {
            const mockGpg = { getPublicKeys: jest.fn() } as any;
            mockGpg.getPublicKeys.mockImplementation(async () => {
                return ['alpha', 'beta'];
            });
            const mockEvent = { reply: jest.fn() } as any;
            const main = new Main(mockGpg);
            await main.onRequestPubKeys(mockEvent);
            expect(mockEvent.reply.mock.calls).toHaveLength(1);
            expect(mockEvent.reply.mock.calls[0]).toEqual([
                Events.PUBKEYS_RESULT,
                ['alpha', 'beta']
            ]);
        });

        it('handles request for public keys when gpg errors', async () => {
            const mockGpg = { getPublicKeys: jest.fn() } as any;
            mockGpg.getPublicKeys.mockImplementation(async () => {
                throw new GpgError(2, 'error');
            });
            const mockEvent = { reply: jest.fn() } as any;
            const main = new Main(mockGpg);
            await main.onRequestPubKeys(mockEvent);
            expect(mockEvent.reply.mock.calls).toHaveLength(1);
            expect(mockEvent.reply.mock.calls[0]).toEqual([
                Events.PUBKEYS_RESULT,
                []
            ]);
        });
    });
});
