import { shallow } from 'enzyme';
import React from 'react';
import PathInput from './PathInput';

describe('PathInput', () => {
    it('should render', () => {
        const wrapper = shallow(
            <PathInput value='foo' label='bar' onChange={() => null} />
        );
        const input = wrapper.find('input');
        expect(input).toHaveLength(1);
        expect(input.prop('value')).toEqual('foo');

        expect(wrapper.find('label').contains('bar')).toBe(true);
    });
});
