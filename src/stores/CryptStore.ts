import { getEnv, Instance, types } from 'mobx-state-tree';
import { Events } from '../Constants';

export const IOText = types
    .model('IOText', {
        val: types.string
    })
    .actions((self) => ({
        setText(text: string) {
            self.val = text;
        }
    }));
export type IIOText = Instance<typeof IOText>;

export const CryptStore = types
    .model('CryptStore', {
        input: IOText,
        output: IOText,
        pending: false
    })
    .actions((self) => {
        return {
            handleGpgCryptResponse(
                event: Electron.IpcRendererEvent,
                result: { text: string; encrypted: boolean }
            ) {
                self.output.setText(result.text);
                this.setPending(false);
            },
            setPending(pending: boolean) {
                self.pending = pending;
            },
            afterCreate() {
                getEnv(self).ipcRenderer.on(
                    Events.CRYPT_RESULT,
                    this.handleGpgCryptResponse
                );
            },
            beforeDestroy() {
                getEnv(self).ipcRenderer.off(
                    Events.CRYPT_RESULT,
                    this.handleGpgCryptResponse
                );
            }
        };
    });
export type ICryptStore = Instance<typeof CryptStore>;
