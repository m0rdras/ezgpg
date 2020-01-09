import { ChildProcess } from 'child_process';
import concat from 'concat-stream';
import fs from 'fs';
import { Readable, Writable } from 'stream';

jest.mock('fs');

import Gpg, { GpgError } from './Gpg';

const ezGpgKeyId = '058CAFED420D6BEEF71B844EBD76DEAD02758394';
const izzyGpgKeyId = 'DEADBEEF420D6BEEF71B844EBD76DEAD02758394';
const listKeysOutput = `
/Users/ezgpg/.gnupg/pubring.gpg
---------------------------------
pub   rsa4096 2019-07-31 [SC]
      ${ezGpgKeyId}
uid           [ unknown] ezgpg <ezgpg@dev.local>
sub   rsa4096 2019-07-31 [E]

pub   rsa4096 2020-07-31 [SC]
      ${izzyGpgKeyId}
uid           [  full ] Izzy Geepegee <izzy@dev.local>
sub   rsa4096 2020-07-31 [E]

`;
const noAddressError = new GpgError(
    2,
    `gpg: no valid addressees
gpg: : encryption failed: No user ID
`
);
const encryptedData = `
-----BEGIN PGP MESSAGE-----
deadbeef42
-----END PGP MESSAGE-----
`;

describe('Gpg', () => {
    let gpg: Gpg;

    describe('constructor', () => {
        const existsMock = fs.existsSync as jest.Mock;
        beforeEach(() => {
            existsMock.mockReset();
        });

        it('tries to find a gpg path', () => {
            existsMock.mockReturnValueOnce(true);
            gpg = new Gpg();

            expect(existsMock.mock.calls.length).toBe(1);
            expect(existsMock.mock.calls[0][0]).toEqual('/usr/local/bin/gpg');
        });

        it('continues to find a gpg path when first guess fails', () => {
            existsMock.mockReturnValueOnce(false).mockReturnValueOnce(true);
            gpg = new Gpg();

            expect(existsMock.mock.calls.length).toBe(2);
            expect(existsMock.mock.calls[0][0]).toEqual('/usr/local/bin/gpg');
            expect(existsMock.mock.calls[1][0]).toEqual('/usr/bin/gpg');
        });

        it('leaves its gpg path empty if not found without erroring out', () => {
            existsMock.mockReturnValue(false);
            gpg = new Gpg();

            expect(gpg.gpgPath).toEqual('');
        });
    });

    describe('with mocked spawn function', () => {
        let stdin = '';
        let exitCode = 0;
        let gpgArgs: readonly string[] | undefined;
        let stdinStream: Writable;
        let stdoutStream: Readable;
        let stderrStream: Readable;
        let closeHandler:
            | ((code: number, signal: NodeJS.Signals) => void)
            | undefined;
        let eventHandler: (
            event: string,
            listener: (code: number, signal: NodeJS.Signals) => void
        ) => void;

        beforeEach(() => {
            const spawnFn = (command: string, args?: readonly string[]) => {
                closeHandler = undefined;
                exitCode = 0;
                gpgArgs = args;
                stdoutStream = new Readable();
                stdoutStream._read = () => {
                    /* noop */
                };
                stderrStream = new Readable();
                stderrStream._read = () => {
                    /* noop */
                };
                stdinStream = concat((buf: Buffer) => {
                    stdin = buf.toString();
                });
                eventHandler = jest.fn(
                    (
                        event: 'close',
                        listener: (code: number, signal: NodeJS.Signals) => void
                    ) => {
                        closeHandler = listener;
                    }
                ) as (
                    event: string,
                    listener: (code: number, signal: NodeJS.Signals) => void
                ) => void;

                setTimeout(() => closeHandler?.(exitCode, 'SIGTERM'), 0);

                return {
                    on: eventHandler,
                    stderr: stderrStream,
                    stdin: stdinStream,
                    stdout: stdoutStream
                } as ChildProcess;
            };

            gpg = new Gpg('gpg', spawnFn);
        });

        describe('spawn', () => {
            it('should spawn and register close handler', async () => {
                await gpg.spawn();
                expect(eventHandler).toHaveBeenCalled();
            });

            it('should receive stdout data', async () => {
                const result = gpg.spawn();
                stdoutStream.push('foobar');
                await expect(result).resolves.toEqual('foobar');
            });

            it('should reject on non-zero exit code', async () => {
                const result = gpg.spawn();
                exitCode = 1;
                stderrStream.push('So sad');
                await expect(result).rejects.toEqual(
                    new GpgError(exitCode, 'So sad')
                );
            });
        });

        describe('getPublicKeys', () => {
            it('should correctly parse gpg -k output', async () => {
                const result = gpg.getPublicKeys();
                stdoutStream.push(listKeysOutput);

                await expect(result).resolves.toEqual([
                    {
                        email: 'ezgpg@dev.local',
                        id: ezGpgKeyId,
                        name: 'ezgpg'
                    },
                    {
                        email: 'izzy@dev.local',
                        id: izzyGpgKeyId,
                        name: 'Izzy Geepegee'
                    }
                ]);
            });
        });

        describe('encrypt', () => {
            it('should encrypt a message to a single recipient', async () => {
                const result = gpg.encrypt('secret', [ezGpgKeyId]);
                stdoutStream.push('encrypted');

                await expect(result).resolves.toEqual('encrypted');
                expect(stdin).toEqual('secret');
                expect(gpgArgs).toEqual([
                    '--batch',
                    '-e',
                    '-a',
                    '--trust-model',
                    'always',
                    '-r',
                    ezGpgKeyId
                ]);
            });
            it('should encrypt a message to a multiple recipients', async () => {
                const result = gpg.encrypt('secret', [
                    ezGpgKeyId,
                    izzyGpgKeyId
                ]);
                stdoutStream.push('encrypted');

                await expect(result).resolves.toEqual('encrypted');
                expect(stdin).toEqual('secret');
                expect(gpgArgs).toEqual([
                    '--batch',
                    '-e',
                    '-a',
                    '--trust-model',
                    'always',
                    '-r',
                    ezGpgKeyId,
                    '-r',
                    izzyGpgKeyId
                ]);
            });
            it('should reject if no recipients are given', async () => {
                const result = gpg.encrypt('secret', []);
                stderrStream.push(noAddressError.message);
                exitCode = noAddressError.code;
                await expect(result).rejects.toEqual(noAddressError);
            });
        });

        describe('decrypt', () => {
            it('should correctly pass input data', async () => {
                const result = gpg.decrypt(encryptedData);
                stdoutStream.push('secret');
                await expect(result).resolves.toEqual('secret');
                expect(stdin).toEqual(encryptedData);
                expect(gpgArgs).toEqual([
                    '--batch',
                    '-d',
                    '-a',
                    '--trust-model',
                    'always'
                ]);
            });
        });

        describe('isEncrypted', () => {
            it('should correctly identify encrypted messages', () => {
                expect(Gpg.isEncrypted(encryptedData)).toBe(true);
            });
            it('should correctly identify unencrypted messages', () => {
                expect(Gpg.isEncrypted('You know nothing')).toBe(false);
            });
        });

        describe('GpgError', () => {
            it('should serialize to string', () => {
                const error = new GpgError(1, 'foo');
                expect(error.toString()).toEqual('Error: foo [Code: 1]');
            });
        });
    });
});
