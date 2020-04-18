import assert from 'assert';
import { ChildProcess, SpawnOptions } from 'child_process';
import spawn from 'cross-spawn';
import debug from 'debug';
import fs from 'fs';

const log = debug('ezgpg:gpg');

export class GpgError extends Error {
    constructor(public readonly code: number, message: string) {
        super(message);
    }

    public toString() {
        return `${super.toString()} [Code: ${this.code}]`;
    }
}

type SpawnFunction = (
    command: string,
    args?: readonly string[],
    options?: SpawnOptions
) => ChildProcess;
const defaultSpawnFn: SpawnFunction = spawn;

export default class Gpg {
    public static isEncrypted = (text: string) => {
        return (
            text.search('-----BEGIN PGP MESSAGE-----') > -1 &&
            text.search('-----END PGP MESSAGE-----\n') > -1
        );
    };

    constructor(
        public gpgPath: string = '',
        private spawnFn: SpawnFunction = defaultSpawnFn
    ) {}

    public detectExecutablePath(): string | null {
        for (const pathOption of ['/usr/local/bin/gpg', '/usr/bin/gpg']) {
            if (this.setExecutablePath(pathOption)) {
                log('Using detected path "%s" for gpg', pathOption);
                return this.gpgPath;
            }
        }

        return null;
    }

    public setExecutablePath(gpgPath: string): boolean {
        if (fs.existsSync(gpgPath)) {
            this.gpgPath = gpgPath;
            log('Set gpg executable path to: "%s"', gpgPath);
            return true;
        }
        return false;
    }

    public spawn(args?: readonly string[], input?: string): Promise<string> {
        log('Spawning GPG with args %o', args);
        if (this.gpgPath.length === 0) {
            return Promise.reject(new Error('gpg executable path not set'));
        }
        return new Promise((resolve, reject) => {
            let stdout = '';
            let stderr = '';

            try {
                const child = this.spawnFn(
                    this.gpgPath,
                    ['--batch'].concat(args ?? [])
                );

                if (
                    child.stderr === null ||
                    child.stdin === null ||
                    child.stdout === null
                ) {
                    return reject(new Error('Error while spawning GPG'));
                }

                child.stderr.on('data', (data) => (stderr += data));
                child.stdout.on('data', (data) => (stdout += data));

                child.on('close', (code) =>
                    code === 0
                        ? resolve(stdout)
                        : reject(new GpgError(code, stderr))
                );

                child.on('error', reject);

                if (input) {
                    child.stdin.end(input);
                }
            } catch (err) {
                log('Unknown error while spawning GPG: %O', err);
                reject(err);
            }
        });
    }

    public async getPublicKeys() {
        log('Getting pub keys');
        return (await this.spawn(['-k']))
            .trim()
            .split('\n')
            .slice(2) // cut first two lines
            .join('\n')
            .split('\n\n')
            .map(Gpg.parseGpgPubKeyOutput);
    }

    public async encrypt(input: string, recipients: readonly string[]) {
        const recipientArgs = recipients.map((id) => ['-r', id]).flat();

        return this.spawn(
            ['-e', '-a', '--trust-model', 'always'].concat(recipientArgs),
            input
        );
    }

    public async decrypt(input: string) {
        return this.spawn(['-d', '-a', '--trust-model', 'always'], input);
    }

    public async deleteKey(keyId: string) {
        return this.spawn(['--delete-keys', keyId]);
    }

    public async importKey(key: string) {
        return this.spawn(['--import'], key);
    }

    private static parseGpgPubKeyOutput = (str: string) => {
        const lines = str.split('\n');
        assert(lines.length >= 4);

        const id = lines[1].trim();
        const matches = lines[2].match(/^uid\s+\[.*] (.*?)( <(.*)>)?$/);
        const name = matches?.[1];
        const email = matches?.[3];

        return { id, name, email };
    };
}
