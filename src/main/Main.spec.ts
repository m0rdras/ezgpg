import Main from './Main';
import { ipcMain } from 'electron';
import { Events } from '../Constants';
import { IpcMain, IpcMainEvent } from 'electron';

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
});
