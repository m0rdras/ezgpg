import { CryptStore } from './CryptStore';

describe('CryptStore', () => {
    const createStore = () =>
        CryptStore.create({
            input: {
                val: ''
            },
            output: {
                val: ''
            },
            pending: false
        });

    it('sets pending flag', () => {
        const store = createStore();
        expect(store.pending).toBe(false);
        store.setPending(true);
        expect(store.pending).toBe(true);
        store.setPending(false);
        expect(store.pending).toBe(false);
    });
});
