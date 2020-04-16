export enum Events {
    CRYPT = 'gpg:crypt',
    CRYPT_RESULT = 'gpg:crypt:result',
    PUBKEYS = 'gpg:pubkeys:get',
    PUBKEYS_RESULT = 'gpg:pubkeys:get:result',
    PUBKEY_DELETE = 'gpg:pubkey:delete',
    LOAD_SETTINGS = 'settings:load',
    LOAD_SETTINGS_RESULT = 'settings:load:result',
    SAVE_SETTINGS = 'settings:save',
    SAVE_SETTINGS_RESULT = 'settings:save:result'
}

export enum StoreKeys {
    SETTINGS = 'settings'
}
