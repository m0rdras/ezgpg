// tslint:disable-next-line:variable-name
let __encrypted = false;
const mock = jest.fn().mockImplementation(() => {
    return {
        decrypt: jest.fn(),
        encrypt: jest.fn(),
        getPublicKeys: jest.fn(),
        // tslint:disable-next-line:object-literal-sort-keys
        __setEncrypted: (encrypted: boolean) => {
            __encrypted = encrypted;
        }
    };
});
(mock as any).isEncrypted = jest.fn().mockImplementation(() => __encrypted);

module.exports = mock;
