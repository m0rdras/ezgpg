import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { Confirm } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';
import KeysMenu from './KeysMenu';

describe('KeysMenu', () => {
    let keyStore: IGpgKeyStore;

    beforeEach(() => {
        keyStore = {
            sortedKeys: [{ id: 'key-id', name: 'foo', email: 'bar' }],
            load: jest.fn(),
            deleteKey: jest.fn()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
    });

    describe('shallowly rendered', () => {
        let wrapper: ShallowWrapper<typeof KeysMenu>;

        beforeEach(() => {
            wrapper = shallow(<KeysMenu keyStore={keyStore} />);
        });

        it('renders', () => {
            expect(wrapper).toHaveLength(1);
        });

        it('reloads keys', () => {
            wrapper.find('Button.reload-button').simulate('click');

            expect(keyStore.load).toHaveBeenCalled();
        });
    });

    describe('on deletion', () => {
        let wrapper: ReactWrapper<typeof KeysMenu>;

        beforeEach(() => {
            wrapper = mount(
                <KeysMenu keyStore={keyStore} selectedId='key-id' />
            );
            wrapper.find('Button.delete-button').simulate('click');
        });

        afterEach(() => wrapper.unmount());

        it('opens confirmation dialog', () => {
            expect(wrapper.find(Confirm).prop('open')).toBe(true);
        });

        it('sends delete request after confirmation', () => {
            wrapper.find('Confirm Button[primary=true]').simulate('click');

            expect(wrapper.find(Confirm).prop('open')).toBe(false);
            expect(keyStore.deleteKey).toHaveBeenCalledWith('key-id');
        });

        it('does not send delete request after cancelling', () => {
            wrapper.find('Confirm Button[content="Cancel"]').simulate('click');

            expect(keyStore.deleteKey).not.toHaveBeenCalled();
        });
    });
});
