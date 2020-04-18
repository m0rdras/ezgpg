import debug from 'debug';
import { ipcMain, IpcMainEvent } from 'electron';
import ElectronStore from 'electron-store';

import { Events, StoreKeys } from '../Constants';
import { Settings } from '../stores/SettingsStore';
import Gpg from './Gpg';

const log = debug('ezgpg:main');

export interface RequestCryptData {
    text: string;
    recipients: readonly string[];
}

export default class Main {
    static initGpgPath = (gpg: Gpg, store: ElectronStore) => {
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
    };

    static setup(gpg = new Gpg(), store = new ElectronStore()): Main {
        log('Starting up main process');

        this.initGpgPath(gpg, store);

        const main = new Main(gpg, store);

        ipcMain.on(Events.KEYS, main.onRequestPubKeys.bind(main));
        ipcMain.on(Events.KEY_DELETE, main.onDeletePubKey.bind(main));
        ipcMain.on(Events.KEY_IMPORT, main.onImportKey.bind(main));
        ipcMain.on(Events.CRYPT, main.onRequestCrypt.bind(main));
        ipcMain.on(Events.LOAD_SETTINGS, main.onLoadSettings.bind(main));
        ipcMain.on(Events.SAVE_SETTINGS, main.onSaveSettings.bind(main));

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
            event.reply(Events.KEYS_RESULT, { pubKeys });
        } catch (error) {
            log('Error while getting public keys: %O', error);
            event.reply(Events.KEYS_RESULT, { pubKeys: [], error });
        }
    }

    async onDeletePubKey(event: Electron.IpcMainEvent, keyId: string) {
        try {
            await this.gpg.deleteKey(keyId);
            event.reply(Events.KEY_DELETE, { keyId });
        } catch (error) {
            event.reply(Events.KEY_DELETE, { keyId, error });
        }
    }

    async onImportKey(event: Electron.IpcMainEvent, key: string) {
        try {
            log('importing...');
            const result = await this.gpg.importKey(key);
            log(result);
            event.reply(Events.KEY_IMPORT, {});
        } catch (error) {
            event.reply(Events.KEY_IMPORT, { error });
        }
    }

    async onRequestCrypt(event: Electron.IpcMainEvent, data: RequestCryptData) {
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

    onSaveSettings(event: IpcMainEvent, settings: Settings) {
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

    applySettings(settings: Settings) {
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
