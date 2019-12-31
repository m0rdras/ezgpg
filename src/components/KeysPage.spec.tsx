import React from 'react';
import { shallow } from 'enzyme';
import KeysPage from './KeysPage';
import { GpgKeyStore } from '../stores/GpgKeyStore';
import { Table } from 'semantic-ui-react';

describe('KeysPage', () => {
    const ipcRendererMock = { on: jest.fn() };
    const keyStore = GpgKeyStore.create(
        {
            gpgKeys: { id: { id: 'id', name: 'foo', email: 'bar' } },
            selectedKeys: []
        },
        { ipcRenderer: ipcRendererMock }
    );

    it('renders', () => {
        const wrapper = shallow(<KeysPage keyStore={keyStore} />);
        expect(wrapper.find(Table.Row)).toHaveLength(2);
    });
});
