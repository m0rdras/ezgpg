import debug from 'debug';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ElectronStore from 'electron-store';

import {
    CryptRequest,
    CryptResponse,
    DeleteKeyResponse,
    Events,
    KeysResponse,
    StoreKeys
} from '../Constants';
import { Settings } from '../stores/SettingsStore';
import Gpg from './Gpg';

const log = debug('ezgpg:main');

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

        ipcMain.handle(Events.KEYS, main.onRequestPubKeys.bind(main));
        ipcMain.handle(Events.KEY_DELETE, main.onDeleteKey.bind(main));
        ipcMain.handle(Events.KEY_IMPORT, main.onImportKey.bind(main));
        ipcMain.handle(Events.CRYPT, main.onRequestCrypt.bind(main));
        ipcMain.handle(Events.LOAD_SETTINGS, main.onLoadSettings.bind(main));
        ipcMain.handle(Events.SAVE_SETTINGS, main.onSaveSettings.bind(main));

        return main;
    }

    constructor(
        private readonly gpg = new Gpg(),
        private readonly store: ElectronStore = new ElectronStore()
    ) {}

    async onRequestPubKeys(): Promise<KeysResponse> {
        try {
            const pubKeys = await this.gpg.getPublicKeys();
            log('Found %d keys', pubKeys.length);
            return { pubKeys };
        } catch (error) {
            log('Error while getting public keys: %O', error);
            return { pubKeys: [], error };
        }
    }

    async onDeleteKey(
        event: IpcMainInvokeEvent,
        keyId: string
    ): Promise<DeleteKeyResponse> {
        try {
            await this.gpg.deleteKey(keyId);
        } catch (error) {
            return { keyId, error };
        }
        return { keyId };
    }

    async onImportKey(event: IpcMainInvokeEvent, key: string) {
        try {
            log('importing...');
            const result = await this.gpg.importKey(key);
            log(result);
            return {};
        } catch (error) {
            return { error };
        }
    }

    async onRequestCrypt(
        event: IpcMainInvokeEvent,
        { text, recipients }: CryptRequest
    ): Promise<CryptResponse> {
        if (Gpg.isEncrypted(text)) {
            return {
                encrypted: false,
                text: await this.gpg.decrypt(text)
            };
        } else if (text.length > 0 && recipients.length > 0) {
            return {
                encrypted: true,
                text: await this.gpg.encrypt(text, recipients)
            };
        } else {
            return { text: '', encrypted: false };
        }
    }

    onLoadSettings() {
        const settings = this.store.get(StoreKeys.SETTINGS);
        log('Loaded settings: %O', settings);
        return settings;
    }

    onSaveSettings(event: IpcMainInvokeEvent, settings: Settings) {
        try {
            this.applySettings(settings);
            log('saving', settings);
            this.store.set(StoreKeys.SETTINGS, settings);
            log('Successfully saved setings: %O', settings);
            return { settings };
        } catch (error) {
            const curSettings = this.store.get(StoreKeys.SETTINGS);
            return {
                error,
                settings: curSettings
            };
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
