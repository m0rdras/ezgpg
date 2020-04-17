import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import KeysPage from './KeysPage';
import { IGpgKeyStore } from '../stores/GpgKeyStore';
import KeysTable from './KeysTable';
import { Table } from 'semantic-ui-react';

describe('KeysPage', () => {
    let wrapper: ReactWrapper<typeof KeysPage>;
    let keyStore: IGpgKeyStore;

    beforeEach(() => {
        keyStore = {
            sortedKeys: [{ id: 'key-id', name: 'foo', email: 'bar' }],
            load: jest.fn(),
            deleteKey: jest.fn()
        } as any;

        wrapper = mount(<KeysPage keyStore={keyStore} />);
    });

    afterEach(() => wrapper.unmount());

    it('renders', () => {
        expect(wrapper).toHaveLength(1);
    });

    it('handles key selection', () => {
        wrapper.find(Table.Row).last().simulate('click');

        expect(wrapper.find(KeysTable).prop('selectedId')).toEqual('key-id');
    });

    it('handles key deselection', () => {
        wrapper.find(Table.Row).last().simulate('click').simulate('click');

        expect(wrapper.find(KeysTable).prop('selectedId')).toBeUndefined();
    });
});
