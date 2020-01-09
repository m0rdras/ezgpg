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
    args?: ReadonlyArray<string>,
    options?: SpawnOptions
) => ChildProcess;
const defaultSpawnFn: SpawnFunction = spawn;

export default class Gpg {
    public static isEncrypted(text: string) {
        return (
            text.search('-----BEGIN PGP MESSAGE-----') > -1 &&
            text.search('-----END PGP MESSAGE-----\n') > -1
        );
    }
    constructor(
        public gpgPath: string = '',
        private spawnFn: SpawnFunction = defaultSpawnFn
    ) {
        if (this.gpgPath.length === 0) {
            for (const pathOption of ['/usr/local/bin/gpg', '/usr/bin/gpg']) {
                if (fs.existsSync(pathOption)) {
                    this.gpgPath = pathOption;
                    log('Using detected path "%s" for gpg', pathOption);
                    break;
                }
            }
        }
    }

    public spawn(args?: readonly string[], input?: string): Promise<string> {
        log('Spawning GPG with args %o', args);
        return new Promise(async (resolve, reject) => {
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

                child.stderr.on('data', data => (stderr += data));

                child.on('close', code =>
                    code === 0
                        ? resolve(stdout)
                        : reject(new GpgError(code, stderr))
                );

                if (input) {
                    child.stdin.end(input);
                }

                for await (const data of child.stdout) {
                    stdout += data;
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
            .map(str => {
                const lines = str.split('\n') ?? [];
                assert(lines.length >= 4);

                const id = lines[1].trim();
                const matches = lines[2].match(/^uid\s+\[.*] (.*?)( <(.*)>)?$/);
                const name = matches?.[1];
                const email =
                    matches?.length && matches.length >= 3
                        ? matches[3]
                        : '<none>';

                return { id, name, email };
            });
    }

    public async encrypt(input: string, recipients: readonly string[]) {
        const recipientArgs = recipients.map(id => ['-r', id]).flat();

        return this.spawn(
            ['-e', '-a', '--trust-model', 'always'].concat(recipientArgs),
            input
        );
    }

    public async decrypt(input: string) {
        return this.spawn(['-d', '-a', '--trust-model', 'always'], input);
    }
}
