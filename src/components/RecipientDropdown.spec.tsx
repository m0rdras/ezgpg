import React from 'react';
import { shallow } from 'enzyme';
import RecipientDropdown from './RecipientDropdown';
import { GpgKeyStore } from '../stores/GpgKeyStore';
import { Dropdown } from 'semantic-ui-react';

describe('RecipientDropdown', () => {
    const ipcRendererMock = { on: jest.fn() };
    const keyStore = GpgKeyStore.create(
        {
            gpgKeys: {
                alpha: { id: 'alpha', name: 'foo', email: 'bar' },
                beta: { id: 'beta', name: 'beeeta', email: 'beta@alpha.com' }
            },
            selectedKeys: []
        },
        { ipcRenderer: ipcRendererMock }
    );
    it('should render', () => {
        const wrapper = shallow(<RecipientDropdown keyStore={keyStore} />);
        expect(wrapper.find(Dropdown)).toHaveLength(1);
        expect(wrapper.find(Dropdown).prop('options')).toEqual([
            {
                key: 'beta',
                text: 'beeeta <beta@alpha.com>',
                value: 'beta'
            },
            {
                key: 'alpha',
                text: 'foo <bar>',
                value: 'alpha'
            }
        ]);
    });

    it('should set selected keys', () => {
        const wrapper = shallow(<RecipientDropdown keyStore={keyStore} />);
        wrapper.find(Dropdown).simulate('change', '', { value: ['alpha'] });
        expect(keyStore.selectedKeys).toEqual([
            { id: 'alpha', name: 'foo', email: 'bar' }
        ]);
    });
});
