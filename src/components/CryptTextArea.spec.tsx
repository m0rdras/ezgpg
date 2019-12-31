import { shallow } from 'enzyme';
import React from 'react';
import { TextArea } from 'semantic-ui-react';

import { IOText } from '../stores/CryptStore';
import CryptTextArea from './CryptTextArea';

describe('CryptTextArea', () => {
    it('should render with unencrypted text', () => {
        const ioText = IOText.create({ val: 'foo' });
        const wrapper = shallow(<CryptTextArea text={ioText} />);
        expect(wrapper.find('.crypttextarea.decrypted')).toHaveLength(1);
        expect(wrapper.find(TextArea).prop('value')).toBe('foo');
    });

    it('should render with encrypted text', () => {
        const val =
            '-----BEGIN PGP MESSAGE-----\nabcdef\n-----END PGP MESSAGE-----\n';
        const ioText = IOText.create({ val });
        const wrapper = shallow(<CryptTextArea text={ioText} />);
        expect(wrapper.find('.crypttextarea.encrypted')).toHaveLength(1);
        expect(wrapper.find(TextArea).prop('value')).toBe(val);
    });

    it('should render a label', () => {
        const ioText = IOText.create({ val: 'foo' });
        const wrapper = shallow(
            <CryptTextArea text={ioText} label={'crypt text'} />
        );
        const label = wrapper.find('label');
        expect(label).toHaveLength(1);
        expect(label.contains('crypt text')).toBe(true);
    });

    it('should react to change events', () => {
        const ioText = IOText.create({ val: 'foo' });
        const wrapper = shallow(<CryptTextArea text={ioText} />);
        wrapper
            .find(TextArea)
            .simulate('change', { currentTarget: { value: 'bar' } });
        expect(ioText.val).toEqual('bar');
    });
});
