import { shallow } from 'enzyme';
import React from 'react';

import { RootStore } from '../stores/RootStore';
import CryptPage from './CryptPage';
import CryptTextArea from './CryptTextArea';
import RecipientDropdown from './RecipientDropdown';

describe('CryptPage', () => {
    const ipcRendererMock = { on: jest.fn(), send: jest.fn() };
    const store = RootStore.create(
        {
            cryptStore: {
                input: {
                    val: ''
                },
                output: {
                    val: ''
                },
                pending: false
            },
            gpgKeyStore: {
                gpgKeys: {},
                selectedKeys: []
            }
        },
        {
            ipcRenderer: ipcRendererMock
        }
    );
    it('should render', () => {
        const wrapper = shallow(<CryptPage store={store} />);
        expect(wrapper.find(RecipientDropdown)).toHaveLength(1);
        expect(wrapper.find(CryptTextArea)).toHaveLength(2);
    });
});
