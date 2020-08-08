import debug from 'debug';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ElectronStore from 'electron-store';

import {
    CryptRequest,
    CryptResponse,
    DeleteKeyResponse,
    Events,
    GetKeysResponse,
    ImportKeyResponse,
    SaveSettingsResponse
} from '../Constants';
import { Settings } from '../stores/SettingsStore';
import Gpg from './Gpg';
import { Migrations } from 'conf/dist/source/types';

const log = debug('ezgpg:main');

const MIGRATIONS: Migrations<Settings> = {
    '1.1.2': (store) => {
        store.set('gpgPath', '');
    }
};

export default class Main {
    static initGpgPath = (gpg: Gpg, store: ElectronStore<Settings>): void => {
        const gpgPath = store.get('gpgPath');
        if (!gpgPath || gpgPath === '' || !gpg.setExecutablePath(gpgPath)) {
            const detectedPath = gpg.detectExecutablePath();
            store.set('gpgPath', detectedPath);
        }
    };

    static setup(gpg = new Gpg(), store?: ElectronStore<Settings>): Main {
        log('Starting up main process');

        if (!store) {
            store = new ElectronStore<Settings>({
                migrations: MIGRATIONS
            });
        }

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
        private readonly store = new ElectronStore<Settings>()
    ) {}

    async onRequestPubKeys(): Promise<GetKeysResponse> {
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

    async onImportKey(
        event: IpcMainInvokeEvent,
        key: string
    ): Promise<ImportKeyResponse> {
        try {
            await this.gpg.importKey(key);
            return { pubKeys: await this.gpg.getPublicKeys() };
        } catch (error) {
            return { pubKeys: await this.gpg.getPublicKeys(), error };
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

    onLoadSettings(): Settings {
        return this.store.store;
    }

    onSaveSettings(
        event: IpcMainInvokeEvent,
        settings: Settings
    ): SaveSettingsResponse {
        try {
            this.applySettings(settings);
            log('saving', settings);
            this.store.set(settings);
            log('Successfully saved setings: %O', settings);
            return { settings };
        } catch (error) {
            return {
                error,
                settings: this.store.store
            };
        }
    }

    applySettings(settings: Settings): void {
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
