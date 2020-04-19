import { Instance, types } from 'mobx-state-tree';

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
            setPending(pending: boolean) {
                self.pending = pending;
            }
        };
    });
export type ICryptStore = Instance<typeof CryptStore>;
