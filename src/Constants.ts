import { IGpgKey } from './stores/GpgKeyStore';
import { Settings } from './stores/SettingsStore';

export enum Events {
    CRYPT = 'gpg:crypt',
    KEYS = 'gpg:keys:get',
    KEY_DELETE = 'gpg:key:delete',
    KEY_IMPORT = 'gpg:key:import',
    LOAD_SETTINGS = 'settings:load',
    SAVE_SETTINGS = 'settings:save'
}

export enum StoreKeys {
    SETTINGS = 'settings'
}

export interface GetKeysResponse {
    pubKeys: IGpgKey[];
    error?: Error;
}

export interface DeleteKeyResponse {
    keyId: string;
    error?: Error;
}

export interface SaveSettingsResponse {
    settings: Settings;
    error?: Error;
}

export type ImportKeyResponse = GetKeysResponse;

export interface CryptRequest {
    text: string;
    recipients: readonly string[];
}

export interface CryptResponse {
    text: string;
    encrypted: boolean;
}
