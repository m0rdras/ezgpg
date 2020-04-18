export enum Events {
    CRYPT = 'gpg:crypt',
    CRYPT_RESULT = 'gpg:crypt:result',
    KEYS = 'gpg:keys:get',
    KEYS_RESULT = 'gpg:keys:get:result',
    KEY_DELETE = 'gpg:key:delete',
    KEY_IMPORT = 'gpg:key:import',
    LOAD_SETTINGS = 'settings:load',
    LOAD_SETTINGS_RESULT = 'settings:load:result',
    SAVE_SETTINGS = 'settings:save',
    SAVE_SETTINGS_RESULT = 'settings:save:result'
}

export enum StoreKeys {
    SETTINGS = 'settings'
}
