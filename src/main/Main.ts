import { ipcMain } from 'electron';
import Gpg from './Gpg';
import debug from 'debug';
import { Events } from '../Constants';

const log = debug('ezgpg:main');

export interface IRequestCryptData {
    text: string;
    recipients: readonly string[];
}

export default class Main {
    constructor(private readonly gpg = new Gpg()) {}

    async onRequestPubKeys(event: Electron.IpcMainEvent) {
        try {
            const recipients = await this.gpg.getPublicKeys();
            log('Found %d keys', recipients.length);
            event.reply(Events.PUBKEYS_RESULT, recipients);
        } catch (error) {
            log('Error while getting public keys: %O', error);
            event.reply(Events.PUBKEYS_RESULT, []);
        }
    }

    async onRequestCrypt(
        event: Electron.IpcMainEvent,
        data: IRequestCryptData
    ) {
        const { text, recipients } = data;
        if (Gpg.isEncrypted(text)) {
            event.reply(Events.CRYPT_RESULT, {
                text: await this.gpg.decrypt(text),
                encrypted: false
            });
        } else if (text.length > 0 && recipients.length > 0) {
            event.reply(Events.CRYPT_RESULT, {
                text: await this.gpg.encrypt(text, recipients),
                encrypted: true
            });
        } else {
            event.reply(Events.CRYPT_RESULT, { text: '', encrypted: false });
        }
    }

    setup() {
        log('Starting up main process');
        ipcMain.on(Events.PUBKEYS, event => this.onRequestPubKeys(event));
        ipcMain.on(Events.CRYPT, async (event, data) =>
            this.onRequestCrypt(event, data)
        );
    }
}
