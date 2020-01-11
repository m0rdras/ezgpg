import debug from 'debug';
import { ipcMain, IpcMainEvent } from 'electron';
import ElectronStore from 'electron-store';

import { Events, StoreKeys } from '../Constants';
import { ISettings } from '../stores/SettingsStore';
import Gpg from './Gpg';

const log = debug('ezgpg:main');

export interface IRequestCryptData {
    text: string;
    recipients: readonly string[];
}

export default class Main {
    constructor(
        private readonly gpg = new Gpg(),
        private readonly store: ElectronStore = new ElectronStore()
    ) {}

    async onRequestPubKeys(event: Electron.IpcMainEvent) {
        try {
            const pubKeys = await this.gpg.getPublicKeys();
            log('Found %d keys', pubKeys.length);
            event.reply(Events.PUBKEYS_RESULT, { pubKeys });
        } catch (error) {
            log('Error while getting public keys: %O', error);
            event.reply(Events.PUBKEYS_RESULT, { pubKeys: [], error });
        }
    }

    async onRequestCrypt(
        event: Electron.IpcMainEvent,
        data: IRequestCryptData
    ) {
        const { text, recipients } = data;
        if (Gpg.isEncrypted(text)) {
            event.reply(Events.CRYPT_RESULT, {
                encrypted: false,
                text: await this.gpg.decrypt(text)
            });
        } else if (text.length > 0 && recipients.length > 0) {
            event.reply(Events.CRYPT_RESULT, {
                encrypted: true,
                text: await this.gpg.encrypt(text, recipients)
            });
        } else {
            event.reply(Events.CRYPT_RESULT, { text: '', encrypted: false });
        }
    }

    onLoadSettings(event: IpcMainEvent) {
        const settings = this.store.get(StoreKeys.SETTINGS);
        log('Loaded settings: %O', settings);
        event.reply(Events.LOAD_SETTINGS_RESULT, settings);
    }

    onSaveSettings(settings: ISettings) {
        this.store.set(StoreKeys.SETTINGS, settings);
        this.applySettings(settings);
    }

    applySettings(settings: ISettings) {
        if (settings) {
            log('Applying settings: %O', settings);
            this.gpg.gpgPath = settings.gpgPath;
        }
    }

    setup() {
        log('Starting up main process');

        this.applySettings(this.store.get(StoreKeys.SETTINGS));

        ipcMain.on(Events.PUBKEYS, event => this.onRequestPubKeys(event));
        ipcMain.on(Events.CRYPT, (event, data) =>
            this.onRequestCrypt(event, data)
        );
        ipcMain.on(Events.LOAD_SETTINGS, event => this.onLoadSettings(event));
        ipcMain.on(Events.SAVE_SETTINGS, (event, data) =>
            this.onSaveSettings(data)
        );
    }
}
