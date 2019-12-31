import {
    ChildProcessWithoutNullStreams,
    spawn,
    SpawnOptionsWithoutStdio
} from 'child_process';
import assert from 'assert';
import debug from 'debug';

const log = debug('ezgpg:gpg');

export class GpgError extends Error {
    constructor(public readonly code: number, message: string) {
        super(message);
    }

    toString() {
        return `${super.toString()} [Code: ${this.code}]`;
    }
}

type SpawnFunction = (
    command: string,
    args?: ReadonlyArray<string>,
    options?: SpawnOptionsWithoutStdio
) => ChildProcessWithoutNullStreams;
const defaultSpawnFn: SpawnFunction = spawn;

export default class Gpg {
    constructor(
        public gpgPath: string = 'gpg',
        private spawnFn: SpawnFunction = defaultSpawnFn
    ) {}

    spawn(args?: readonly string[], input?: string): Promise<string> {
        log('Spawning GPG with args %o', args);
        return new Promise(async (resolve, reject) => {
            let stdout = '';
            let stderr = '';

            const child = this.spawnFn(
                this.gpgPath,
                ['--batch'].concat(args ?? [])
            );

            child.stderr.on('data', data => {
                stderr += data;
            });

            child.on('close', code => {
                log('closing');
                if (code !== 0) {
                    reject(new GpgError(code, stderr));
                } else {
                    resolve(stdout);
                }
            });

            if (input) {
                child.stdin.end(input);
            }

            for await (const data of child.stdout) {
                stdout += data;
            }
        });
    }

    async getPublicKeys() {
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

    async encrypt(input: string, recipients: readonly string[]) {
        const recipientArgs = recipients.map(id => ['-r', id]).flat();

        return await this.spawn(
            ['-e', '-a', '--trust-model', 'always'].concat(recipientArgs),
            input
        );
    }

    async decrypt(input: string) {
        return await this.spawn(['-d', '-a', '--trust-model', 'always'], input);
    }

    static isEncrypted(text: string) {
        return (
            text.search('-----BEGIN PGP MESSAGE-----') > -1 &&
            text.search('-----END PGP MESSAGE-----\n') > -1
        );
    }
}
