import React from 'react';
import { shallow } from 'enzyme';
import CryptPage from './CryptPage';
import { RootStore } from '../stores/RootStore';
import CryptTextArea from './CryptTextArea';
import RecipientDropdown from './RecipientDropdown';

describe('CryptPage', () => {
    const ipcRendererMock = { on: jest.fn(), send: jest.fn() };
    const store = RootStore.create(
        {
            gpgKeyStore: {
                gpgKeys: {},
                selectedKeys: []
            },
            cryptStore: {
                input: {
                    val: ''
                },
                output: {
                    val: ''
                },
                pending: false
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
