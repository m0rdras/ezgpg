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
uid           [ unknown] ezgpg
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

    describe('detection of gpg executable', () => {
        const existsMock = fs.existsSync as jest.Mock;
        const DEFAULT_PATHS = ['/usr/local/bin/gpg', '/usr/bin/gpg'];

        beforeEach(() => {
            existsMock.mockReset();
            gpg = new Gpg();
        });

        it('tries to find a gpg path', () => {
            existsMock.mockReturnValueOnce(true);

            const detectedPath = gpg.detectExecutablePath();

            expect(existsMock.mock.calls.length).toBe(1);
            expect(existsMock.mock.calls[0][0]).toEqual(DEFAULT_PATHS[0]);
            expect(detectedPath).toEqual(DEFAULT_PATHS[0]);
        });

        it('continues to find a gpg path when first guess fails', () => {
            existsMock.mockReturnValueOnce(false).mockReturnValueOnce(true);

            const detectedPath = gpg.detectExecutablePath();

            expect(existsMock.mock.calls.length).toBe(2);
            expect(existsMock.mock.calls[0][0]).toEqual(DEFAULT_PATHS[0]);
            expect(existsMock.mock.calls[1][0]).toEqual(DEFAULT_PATHS[1]);
            expect(detectedPath).toEqual(DEFAULT_PATHS[1]);
        });

        it('leaves its gpg path empty if not found without erroring out', () => {
            existsMock.mockReturnValue(false);

            const detectedPath = gpg.detectExecutablePath();

            expect(detectedPath).toBeNull();
        });
    });

    describe('with execution problems', () => {
        it('should reject when gpg path is not set', async () => {
            gpg = new Gpg('');
            await expect(gpg.spawn()).rejects.toEqual(
                new Error('gpg executable path not set')
            );
        });

        it('should reject when stdio is null', async () => {
            const spawnFn = () =>
                ({
                    on: jest.fn(),
                    stderr: null,
                    stdin: null,
                    stdout: null
                } as any);
            gpg = new Gpg('gpg', spawnFn);
            const result = gpg.spawn();
            await expect(result).rejects.toEqual(
                new Error('Error while spawning GPG')
            );
        });

        it('should reject when spawn throws', async () => {
            const spawnFn = () => {
                throw new Error('epic fail');
            };
            gpg = new Gpg('gpg', spawnFn);
            const result = gpg.spawn();
            await expect(result).rejects.toEqual(new Error('epic fail'));
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
                        event: string,
                        listener: (code: number, signal: NodeJS.Signals) => void
                    ) => {
                        if (event === 'close') {
                            closeHandler = listener;
                        }
                    }
                );

                setImmediate(() => closeHandler?.(exitCode, 'SIGTERM'));

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
                        email: undefined,
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
