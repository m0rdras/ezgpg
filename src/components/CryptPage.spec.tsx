import { shallow } from 'enzyme';
import React from 'react';

import CryptPage from './CryptPage';
import CryptTextArea from './CryptTextArea';
import RecipientDropdown from './RecipientDropdown';
import { GpgKeyStore } from '../stores/GpgKeyStore';
import { CryptStore } from '../stores/CryptStore';

describe('CryptPage', () => {
    const cryptStore = CryptStore.create({
        input: {
            val: ''
        },
        output: {
            val: ''
        },
        pending: false
    });
    const gpgKeyStore = GpgKeyStore.create({
        gpgKeys: {},
        selectedKeys: []
    });

    it('should render', () => {
        const wrapper = shallow(
            <CryptPage cryptStore={cryptStore} gpgKeyStore={gpgKeyStore} />
        );
        expect(wrapper.find(RecipientDropdown)).toHaveLength(1);
        expect(wrapper.find(CryptTextArea)).toHaveLength(2);
    });
});
