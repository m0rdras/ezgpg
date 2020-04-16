import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { Confirm, Table } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';
import KeysPage from './KeysPage';

describe('KeysPage', () => {
    let keyStore: IGpgKeyStore;

    beforeEach(() => {
        keyStore = {
            sortedKeys: [{ id: 'key-id', name: 'foo', email: 'bar' }],
            load: jest.fn(),
            deleteKey: jest.fn()
        } as any;
    });

    describe('shallowly rendered', () => {
        let wrapper: ShallowWrapper<typeof KeysPage>;

        beforeEach(() => {
            wrapper = shallow(<KeysPage keyStore={keyStore} />);
        });

        it('renders', () => {
            expect(wrapper.find(Table.Row)).toHaveLength(2);
        });

        it('reloads keys', () => {
            wrapper.find('Button.reload-button').simulate('click');

            expect(keyStore.load).toHaveBeenCalled();
        });
    });

    // TODO these tests prevent clean jest exit
    describe('on deletion', () => {
        let wrapper: ReactWrapper<typeof KeysPage>;

        beforeEach(() => {
            wrapper = mount(<KeysPage keyStore={keyStore} />);
            wrapper.find(Table.Row).last().simulate('click');
            wrapper.find('Button.delete-button').simulate('click');
        });

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
