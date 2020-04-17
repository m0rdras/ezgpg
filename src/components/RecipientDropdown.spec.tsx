import { shallow } from 'enzyme';
import React from 'react';
import { Dropdown } from 'semantic-ui-react';

import { GpgKeyStore } from '../stores/GpgKeyStore';
import RecipientDropdown from './RecipientDropdown';

describe('RecipientDropdown', () => {
    const ipcRendererMock = { on: jest.fn() };
    const keyStore = GpgKeyStore.create(
        {
            gpgKeys: {
                alpha: { id: 'alpha', name: 'alpha name' },
                beta: { id: 'beta', email: 'bar@alpha.local' }
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
                text: '[unnamed] <bar@alpha.local>',
                value: 'beta'
            },
            {
                key: 'alpha',
                text: 'alpha name',
                value: 'alpha'
            }
        ]);
    });

    it('should set selected keys', () => {
        const wrapper = shallow(<RecipientDropdown keyStore={keyStore} />);
        wrapper.find(Dropdown).simulate('change', '', { value: ['alpha'] });
        expect(keyStore.selectedKeys).toEqual([
            { id: 'alpha', name: 'alpha name' }
        ]);
    });
});
