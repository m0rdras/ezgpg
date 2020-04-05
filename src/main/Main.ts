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
    static initGpgPath(gpg: Gpg, store: ElectronStore) {
        const settings = store.get(StoreKeys.SETTINGS, {});
        if (settings?.gpgPath) {
            if (!gpg.setExecutablePath(settings.gpgPath)) {
                settings.gpgPath = gpg.detectExecutablePath();
            }
        } else {
            settings.gpgPath = gpg.detectExecutablePath();
        }
        store.set(StoreKeys.SETTINGS, settings);
        return settings;
    }

    static setup(gpg = new Gpg(), store = new ElectronStore()): Main {
        log('Starting up main process');

        this.initGpgPath(gpg, store);

        const main = new Main(gpg, store);

        ipcMain.on(Events.PUBKEYS, event => main.onRequestPubKeys(event));
        ipcMain.on(Events.CRYPT, (event, data) =>
            main.onRequestCrypt(event, data)
        );
        ipcMain.on(Events.LOAD_SETTINGS, event => main.onLoadSettings(event));
        ipcMain.on(Events.SAVE_SETTINGS, (event, data) =>
            main.onSaveSettings(event, data)
        );

        return main;
    }

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

    onSaveSettings(event: IpcMainEvent, settings: ISettings) {
        try {
            this.applySettings(settings);
            log('saving', settings);
            this.store.set(StoreKeys.SETTINGS, settings);
            log('Successfully saved setings: %O', settings);
            event.reply(Events.SAVE_SETTINGS_RESULT, { settings });
        } catch (error) {
            const curSettings = this.store.get(StoreKeys.SETTINGS);
            event.reply(Events.SAVE_SETTINGS_RESULT, {
                error,
                settings: curSettings
            });
        }
    }

    applySettings(settings: ISettings) {
        if (settings?.gpgPath) {
            log('Applying settings: %O', settings);
            if (!this.gpg.setExecutablePath(settings.gpgPath)) {
                log('Could not set GPG path to %s', settings.gpgPath);
                throw new Error(
                    `Could not set executable path to ${settings.gpgPath}`
                );
            }
        }
    }
}
