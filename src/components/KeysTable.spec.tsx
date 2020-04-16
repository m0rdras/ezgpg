import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { Table } from 'semantic-ui-react';

import KeysTable from './KeysTable';

describe('KeysTable', () => {
    const keys = [{ id: 'key-id', name: 'foo', email: 'bar' }];

    let onSelectKeyMock: jest.Mock;
    let wrapper: ShallowWrapper<typeof KeysTable>;

    beforeEach(() => {
        onSelectKeyMock = jest.fn();
        wrapper = shallow(
            <KeysTable keys={keys} onSelectKey={onSelectKeyMock} />
        );
    });

    it('renders', () => {
        expect(wrapper.find(Table.Row)).toHaveLength(2);
    });

    it('handles clicks', () => {
        wrapper.find(Table.Row).last().simulate('click');
        expect(onSelectKeyMock).toHaveBeenCalledWith('key-id');
    });
});
